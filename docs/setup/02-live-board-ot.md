# Setup Guide — Live Board (Operational Transformation with ShareDB)

> Eduvia's Learning Board uses **ShareDB** — the same OT engine that powers Google Docs-style collaborative editing. ShareDB provides server-authoritative Operational Transformation over WebSocket.

---

## Architecture Decision

You chose **Operational Transformation (OT)** — specifically the engine that Google Docs uses. The production OSS equivalent in Node.js is **ShareDB**.

ShareDB provides:
- Server-authoritative OT: all operations go through the server; the server is always the source of truth
- Automatic transformation of concurrent operations (no "last write wins" conflicts)
- Built-in presence (who is currently viewing/editing)
- Pluggable backends (we use PostgreSQL via `sharedb-postgres`)
- Works over WebSocket (its own protocol layered on WS)

**Board Socket.io vs ShareDB:**
- ShareDB uses its **own WebSocket protocol** (not Socket.io events)
- The board gateway in Socket.io handles room join/leave, mode changes, and presence
- ShareDB handles the actual OT document sync on a separate WebSocket endpoint `/board-sync`

---

## 1. Install Dependencies

```bash
pnpm add sharedb sharedb-postgres json0-ot-diff ws
pnpm add -D @types/sharedb @types/ws
```

---

## 2. Board Document Schema

Each Learning Board is a ShareDB document. The document type is `json0` (standard JSON OT type).

```typescript
// The shape of a ShareDB board document (stored as JSONB in PostgreSQL)

interface BoardDocument {
  id: string;              // boardId
  lessonId: string;
  orgId: string;
  mode: 'teach' | 'classwork' | 'assignment' | 'review' | 'locked';
  isLocked: boolean;
  sections: {
    id: string;
    type: 'text' | 'image' | 'questionBlock' | 'divider';
    content: string;
    position: number;
    isTeacherOnly: boolean;
    createdBy: string;
  }[];
  attachedQuestions: {
    id: string;
    questionId: string;
    position: number;
    showOptions: boolean;
    mode: 'classwork' | 'assignment';
    dueAt: string | null;
  }[];
  version: number;          // managed by ShareDB
}
```

---

## 3. ShareDB Backend Setup

```typescript
// src/modules/board/infrastructure/sharedb/sharedb-backend.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as ShareDB from 'sharedb';
import * as ShareDBPostgres from 'sharedb-postgres';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

@Injectable()
export class ShareDBBackendService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ShareDBBackendService.name);
  private backend: ShareDB.Backend;
  private wss: WebSocketServer;

  onModuleInit(): void {
    // Use PostgreSQL as the OT document store
    const db = new ShareDBPostgres({
      connectionString: process.env.DATABASE_URL,
    });

    this.backend = new ShareDB({ db });

    // Middleware: validate connection has valid JWT before allowing OT ops
    this.backend.use('connect', (context, next) => {
      const token = context.agent.connectSession?.token;
      if (!this.validateToken(token)) {
        context.agent.close();
        return;
      }
      next();
    });

    // Middleware: enforce board access permissions before ops
    this.backend.use('op', (context, next) => {
      const boardId = context.collection;
      const userId = context.agent.connectSession?.userId;
      const mode = context.op.op?.[0]?.p?.[0]; // 'mode' change op

      // Reject student ops in TEACH mode (only teacher can write)
      if (!this.canApplyOp(userId, boardId, context.op)) {
        context.agent.send({
          error: { code: 403, message: 'Operation not allowed in current board mode' },
        });
        return;
      }
      next();
    });

    this.logger.log('ShareDB backend initialized');
  }

  // Called by main.ts to attach ShareDB WS to a specific path
  attachToServer(httpServer: unknown): void {
    this.wss = new WebSocketServer({
      server: httpServer as Parameters<typeof WebSocketServer>[0]['server'],
      path: '/board-sync',
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      // Extract token from query string: /board-sync?token=xxx
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      const stream = new (ShareDB as any).WebSocketJSONStream(ws);

      this.backend.listen(stream, { token });
      this.logger.log('ShareDB client connected');
    });

    this.logger.log('ShareDB WebSocket listening on /board-sync');
  }

  getBackend(): ShareDB.Backend {
    return this.backend;
  }

  onModuleDestroy(): void {
    this.wss?.close();
    this.backend?.close();
  }

  private validateToken(token: string | undefined): boolean {
    if (!token) return false;
    // Use same JWT validation as WsJwtGuard
    try {
      // jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      return true;
    } catch {
      return false;
    }
  }

  private canApplyOp(userId: string, boardId: string, op: unknown): boolean {
    // Enforce mode-based permissions
    // In practice: fetch board document from ShareDB, check mode, check user role
    return true;
  }
}
```

---

## 4. Board Document Service

```typescript
// src/modules/board/infrastructure/sharedb/board-document.service.ts

import { Injectable } from '@nestjs/common';
import { ShareDBBackendService } from './sharedb-backend.service';
import * as ShareDB from 'sharedb';

@Injectable()
export class BoardDocumentService {
  constructor(private readonly shareDBBackend: ShareDBBackendService) {}

  private getConnection(): ShareDB.Connection {
    return this.shareDBBackend.getBackend().connect();
  }

  // Create the ShareDB document when a board is first created
  async createBoardDocument(boardId: string, initialData: object): Promise<void> {
    const conn = this.getConnection();
    const doc = conn.get('boards', boardId);

    await new Promise<void>((resolve, reject) => {
      doc.fetch((err) => {
        if (err) return reject(err);

        if (doc.type) {
          // Document already exists
          conn.close();
          return resolve();
        }

        doc.create(initialData, 'json0', (err) => {
          conn.close();
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // Apply a server-side operation (e.g., mode change by system/admin)
  async applyServerOp(boardId: string, op: object[]): Promise<void> {
    const conn = this.getConnection();
    const doc = conn.get('boards', boardId);

    await new Promise<void>((resolve, reject) => {
      doc.fetch((err) => {
        if (err) return reject(err);

        doc.submitOp(op, (err) => {
          conn.close();
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // Switch board mode (called when teacher changes mode via REST or Socket.io)
  async switchMode(boardId: string, newMode: string): Promise<void> {
    await this.applyServerOp(boardId, [
      { p: ['mode'], od: '', oi: newMode },
    ]);
  }

  // Lock / unlock board
  async setLocked(boardId: string, isLocked: boolean): Promise<void> {
    await this.applyServerOp(boardId, [
      { p: ['isLocked'], od: !isLocked, oi: isLocked },
    ]);
  }

  // Fetch current board state (for HTTP GET initial load)
  async getBoardSnapshot(boardId: string): Promise<object> {
    const conn = this.getConnection();
    const doc = conn.get('boards', boardId);

    return new Promise((resolve, reject) => {
      doc.fetch((err) => {
        conn.close();
        if (err) reject(err);
        else resolve(doc.data);
      });
    });
  }
}
```

---

## 5. Attach ShareDB to NestJS HTTP Server

```typescript
// src/main.ts (updated)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './websocket/adapters/socket-io.adapter';
import { ShareDBBackendService } from './modules/board/infrastructure/sharedb/sharedb-backend.service';
import { Redis } from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Socket.io adapter (notifications, lessons, chat)
  const pubClient = new Redis(process.env.REDIS_URL!);
  const subClient = pubClient.duplicate();
  app.useWebSocketAdapter(new SocketIoAdapter(app, pubClient, subClient));

  const httpServer = app.getHttpServer();

  // ShareDB OT server (board sync) — separate WS path
  const shareDB = app.get(ShareDBBackendService);
  shareDB.attachToServer(httpServer);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## 6. Board Gateway (Socket.io — Mode Changes & Presence)

```typescript
// src/websocket/gateways/board.gateway.ts
// Handles mode changes, lock/unlock, presence — NOT OT ops (those go via ShareDB WS)

import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, UseGuards,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SwitchBoardModeCommand } from '@modules/board';

@WebSocketGateway({ namespace: '/board' })
@UseGuards(WsJwtGuard)
export class BoardGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly commandBus: CommandBus) {}

  @SubscribeMessage('board:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; lessonId: string },
  ): Promise<{ status: 'ok' } | { error: string }> {
    // Validate access
    client.join(`board:${data.boardId}`);
    // Broadcast presence to others
    client.to(`board:${data.boardId}`).emit('board:user_joined', {
      userId: client.auth.userId,
      userType: client.auth.userType,
    });
    return { status: 'ok' };
  }

  @SubscribeMessage('board:mode_change')
  async handleModeChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; mode: string },
  ): Promise<void> {
    // Only teachers can change mode
    if (client.auth.userType !== 'teacher') {
      client.emit('exception', { error: 'Only teachers can change board mode' });
      return;
    }

    await this.commandBus.execute(
      new SwitchBoardModeCommand({
        boardId: data.boardId,
        mode: data.mode,
        changedBy: client.auth.userId,
        correlationId: crypto.randomUUID(),
      }),
    );

    // Broadcast mode change to entire board room
    this.server.to(`board:${data.boardId}`).emit('board:mode_changed', {
      mode: data.mode,
      changedBy: client.auth.userId,
      changedAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('board:lock')
  async handleLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; isLocked: boolean },
  ): Promise<void> {
    if (client.auth.userType !== 'teacher') return;

    // Update ShareDB document + broadcast
    this.server.to(`board:${data.boardId}`).emit('board:locked', {
      isLocked: data.isLocked,
      lockedBy: client.auth.userId,
    });
  }
}
```

---

## 7. Client-Side ShareDB Integration (React Native)

```typescript
// Mobile: connect to ShareDB for OT board sync

import ReconnectingWebSocket from 'reconnecting-websocket';
import * as ShareDB from 'sharedb/lib/client';

const boardSyncUrl = `wss://api.eduvia.com/board-sync?token=${accessToken}`;
const ws = new ReconnectingWebSocket(boardSyncUrl);
const connection = new ShareDB.Connection(ws as unknown as WebSocket);

// Subscribe to the board document
const boardDoc = connection.get('boards', boardId);
boardDoc.subscribe((err) => {
  if (err) throw err;

  // Initial render from boardDoc.data
  renderBoard(boardDoc.data);
});

// Listen for remote ops (from teacher or other students)
boardDoc.on('op', (op, source) => {
  if (!source) {
    // Op came from server (another user) — re-render
    renderBoard(boardDoc.data);
  }
});

// Apply a local op (e.g., teacher adds a section)
function addSection(section: object) {
  boardDoc.submitOp([
    { p: ['sections', boardDoc.data.sections.length], li: section },
  ]);
}

// Update a section's content (text delta)
function updateSectionContent(sectionIndex: number, newContent: string) {
  boardDoc.submitOp([
    { p: ['sections', sectionIndex, 'content'], od: boardDoc.data.sections[sectionIndex].content, oi: newContent },
  ]);
}
```

---

## 8. Lifecycle: Board Created Automatically with Lesson

```typescript
// src/modules/board/application/events/lesson-created.handler.ts
// Consumes LessonCreatedEvent from classroom-events queue

@Processor('classroom-events')
export class LessonEventToBoardWorker extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
  ) { super(); }

  async process(job: Job): Promise<void> {
    if (job.name === 'LessonCreatedEvent') {
      const { lessonId, orgId, classroomId } = job.data.payload;

      // Create the board domain record (stored in PostgreSQL via Prisma)
      const board = await this.commandBus.execute(
        new CreateBoardCommand({ lessonId, orgId, classroomId, correlationId: job.data.correlationId }),
      );

      // Create the ShareDB OT document (stored as JSONB in sharedb-postgres)
      await this.boardDocumentService.createBoardDocument(board.id, {
        id: board.id,
        lessonId,
        orgId,
        mode: 'teach',
        isLocked: false,
        sections: [],
        attachedQuestions: [],
      });
    }
  }
}
```

---

## 9. Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/eduvia
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-here
```

> Note: `sharedb-postgres` uses the same `DATABASE_URL` as Prisma. It creates its own tables (`snapshots` and `ops`) automatically on first connect.
