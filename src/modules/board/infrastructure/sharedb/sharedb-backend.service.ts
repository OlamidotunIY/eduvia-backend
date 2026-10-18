import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Optional,
} from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { JwtService } from '@nestjs/jwt';

export interface OtOp {
  p: (string | number)[];
  oi?: any;
  od?: any;
  li?: any;
  ld?: any;
  na?: number;
}

export interface BoardSnapshot {
  id: string;
  lessonId: string;
  orgId: string;
  mode: string;
  isLocked: boolean;
  sections: Array<{
    id: string;
    type: string;
    content: string;
    position: number;
    isTeacherOnly: boolean;
    createdBy: string;
  }>;
  attachedQuestions: Array<{
    id: string;
    questionId: string;
    position: number;
    showOptions: boolean;
    mode: string;
    dueAt: string | null;
  }>;
  version: number;
}

interface ClientSession {
  ws: WebSocket;
  userId: string;
  orgId: string;
  role: string;
  subscribedBoards: Set<string>;
}

@Injectable()
export class ShareDBBackendService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ShareDBBackendService.name);
  private wss: WebSocketServer | null = null;
  private readonly documents = new Map<string, BoardSnapshot>();
  private readonly clients = new Map<WebSocket, ClientSession>();

  constructor(@Optional() private readonly jwtService?: JwtService) {}

  onModuleInit(): void {
    this.logger.log('ShareDB OT Backend initialized');
  }

  attachToServer(httpServer: any): void {
    this.wss = new WebSocketServer({
      server: httpServer,
      path: '/board-sync',
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const url = new URL(req.url ?? '', `http://${req.headers.host ?? 'localhost'}`);
      const token =
        url.searchParams.get('token') ??
        req.headers.authorization?.replace(/^Bearer\s+/i, '');

      const user = this.authenticateClient(token);
      if (!user) {
        this.logger.warn('Unauthorized ShareDB connection attempt rejected');
        ws.close(4001, 'Unauthorized');
        return;
      }

      const session: ClientSession = {
        ws,
        userId: user.userId,
        orgId: user.orgId,
        role: user.role,
        subscribedBoards: new Set(),
      };
      this.clients.set(ws, session);

      this.logger.log(
        `ShareDB client connected (User: ${session.userId}, Role: ${session.role})`,
      );

      ws.on('message', (raw: Buffer | string) => {
        try {
          const msg = JSON.parse(raw.toString());
          this.handleClientMessage(session, msg);
        } catch (err) {
          this.logger.error(`Error handling ShareDB message: ${(err as Error).message}`);
          ws.send(JSON.stringify({ a: 'error', error: (err as Error).message }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        this.logger.log(`ShareDB client disconnected: ${session.userId}`);
      });
    });

    this.logger.log('ShareDB WebSocket server attached to /board-sync');
  }

  private authenticateClient(
    token?: string | null,
  ): { userId: string; orgId: string; role: string } | null {
    if (!token) {
      if (process.env.NODE_ENV === 'test' || !process.env.JWT_SECRET) {
        return { userId: 'anonymous', orgId: 'test-org', role: 'teacher' };
      }
      return null;
    }

    try {
      if (this.jwtService) {
        const payload = this.jwtService.verify(token);
        return {
          userId: payload.sub ?? payload.userId,
          orgId: payload.orgId ?? '',
          role: payload.role ?? 'student',
        };
      }
      return { userId: 'user-default', orgId: 'org-default', role: 'teacher' };
    } catch {
      return null;
    }
  }

  private handleClientMessage(session: ClientSession, msg: any): void {
    const action = msg.a;
    const boardId = msg.d;

    if (!boardId) return;

    switch (action) {
      case 'sub': // Subscribe to board document
        session.subscribedBoards.add(boardId);
        const doc = this.getOrCreateDocument(boardId);
        session.ws.send(
          JSON.stringify({
            a: 'init',
            d: boardId,
            data: doc,
            v: doc.version,
          }),
        );
        break;

      case 'unsub': // Unsubscribe
        session.subscribedBoards.delete(boardId);
        break;

      case 'op': // Client Operational Transformation operation
        this.handleOp(session, boardId, msg.op, msg.v);
        break;

      case 'presence': // Cursor / presence synchronization
        this.broadcastToSubscribers(
          boardId,
          {
            a: 'presence',
            d: boardId,
            userId: session.userId,
            p: msg.p,
          },
          session.ws,
        );
        break;

      default:
        break;
    }
  }

  private handleOp(
    session: ClientSession,
    boardId: string,
    ops: OtOp[],
    _clientVersion: number,
  ): void {
    const doc = this.getOrCreateDocument(boardId);

    // Permission enforcement:
    // When board is in 'teach' mode, only teachers can edit
    if (doc.mode === 'teach' && session.role === 'student') {
      session.ws.send(
        JSON.stringify({
          a: 'op_error',
          d: boardId,
          error: 'Students cannot edit during Teach Mode',
        }),
      );
      return;
    }

    if (doc.isLocked) {
      session.ws.send(
        JSON.stringify({
          a: 'op_error',
          d: boardId,
          error: 'Board is currently locked',
        }),
      );
      return;
    }

    // Apply JSON0 operations to the document
    this.applyJsonOps(doc, ops);
    doc.version += 1;

    // Acknowledge to sender
    session.ws.send(
      JSON.stringify({
        a: 'op_ack',
        d: boardId,
        v: doc.version,
      }),
    );

    // Broadcast applied operation to all other connected subscribers
    this.broadcastToSubscribers(
      boardId,
      {
        a: 'op',
        d: boardId,
        op: ops,
        v: doc.version,
        userId: session.userId,
      },
      session.ws,
    );
  }

  public applyServerOp(boardId: string, ops: OtOp[]): void {
    const doc = this.getOrCreateDocument(boardId);
    this.applyJsonOps(doc, ops);
    doc.version += 1;

    this.broadcastToSubscribers(boardId, {
      a: 'op',
      d: boardId,
      op: ops,
      v: doc.version,
      userId: 'server',
    });
  }

  private applyJsonOps(doc: any, ops: OtOp[]): void {
    if (!Array.isArray(ops)) return;

    for (const op of ops) {
      if (!op.p || op.p.length === 0) continue;

      let target = doc;
      for (let i = 0; i < op.p.length - 1; i++) {
        const key = op.p[i];
        if (target[key] === undefined) {
          target[key] = typeof op.p[i + 1] === 'number' ? [] : {};
        }
        target = target[key];
      }

      const lastKey = op.p[op.p.length - 1];

      if (op.oi !== undefined) {
        target[lastKey] = op.oi;
      } else if (op.od !== undefined) {
        delete target[lastKey];
      } else if (op.li !== undefined && Array.isArray(target)) {
        target.splice(Number(lastKey), 0, op.li);
      } else if (op.ld !== undefined && Array.isArray(target)) {
        target.splice(Number(lastKey), 1);
      } else if (op.na !== undefined && typeof target[lastKey] === 'number') {
        target[lastKey] += op.na;
      }
    }
  }

  private broadcastToSubscribers(
    boardId: string,
    message: object,
    excludeWs?: WebSocket,
  ): void {
    const payload = JSON.stringify(message);
    for (const [ws, session] of this.clients.entries()) {
      if (ws !== excludeWs && session.subscribedBoards.has(boardId) && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  public getOrCreateDocument(boardId: string, initial?: Partial<BoardSnapshot>): BoardSnapshot {
    let doc = this.documents.get(boardId);
    if (!doc) {
      doc = {
        id: boardId,
        lessonId: initial?.lessonId ?? '',
        orgId: initial?.orgId ?? '',
        mode: initial?.mode ?? 'teach',
        isLocked: initial?.isLocked ?? false,
        sections: initial?.sections ?? [],
        attachedQuestions: initial?.attachedQuestions ?? [],
        version: initial?.version ?? 0,
      };
      this.documents.set(boardId, doc);
    }
    return doc;
  }

  public getDocumentSnapshot(boardId: string): BoardSnapshot | null {
    return this.documents.get(boardId) ?? null;
  }

  public getConnectedClientCount(): number {
    return this.clients.size;
  }

  onModuleDestroy(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    this.clients.clear();
  }
}
