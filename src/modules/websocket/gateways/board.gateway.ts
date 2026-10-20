import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { WsExceptionFilter } from '../filters/ws-exception.filter';

@WebSocketGateway({
  namespace: '/board',
  cors: { origin: '*', credentials: true },
})
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BoardGateway.name);

  handleConnection(client: Socket): void {
    const userId = client.auth?.userId || client.auth?.sub;
    this.logger.log(`Client ${client.id} connected to /board (User: ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected from /board`);
  }

  @SubscribeMessage('board:join')
  async handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ): Promise<{ status: 'ok' } | { error: string }> {
    if (!data?.boardId) {
      return { error: 'boardId is required' };
    }

    const room = `board:${data.boardId}`;
    client.join(room);

    const userId = client.auth?.userId || client.auth?.sub;
    client.to(room).emit('board:user_joined', {
      boardId: data.boardId,
      userId,
      userType: client.auth?.userType,
      joinedAt: new Date().toISOString(),
    });

    return { status: 'ok' };
  }

  @SubscribeMessage('board:leave')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ): { status: 'ok' } {
    if (data?.boardId) {
      const room = `board:${data.boardId}`;
      client.leave(room);

      const userId = client.auth?.userId || client.auth?.sub;
      client.to(room).emit('board:user_left', {
        boardId: data.boardId,
        userId,
        leftAt: new Date().toISOString(),
      });
    }
    return { status: 'ok' };
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; x: number; y: number },
  ): void {
    if (!data?.boardId) return;

    const room = `board:${data.boardId}`;
    const userId = client.auth?.userId || client.auth?.sub;

    client.to(room).emit('cursor:moved', {
      userId,
      x: data.x,
      y: data.y,
      timestamp: Date.now(),
    });
  }

  public broadcastModeChange(boardId: string, mode: string): void {
    if (!this.server) return;
    this.server.to(`board:${boardId}`).emit('board:mode_changed', {
      boardId,
      mode,
      updatedAt: new Date().toISOString(),
    });
  }

  public broadcastLockChange(boardId: string, isLocked: boolean): void {
    if (!this.server) return;
    this.server.to(`board:${boardId}`).emit('board:lock_changed', {
      boardId,
      isLocked,
      updatedAt: new Date().toISOString(),
    });
  }

  public broadcastSectionAdded(boardId: string, section: any): void {
    if (!this.server) return;
    this.server.to(`board:${boardId}`).emit('board:section_added', {
      boardId,
      section,
    });
  }

  public broadcastSectionUpdated(boardId: string, section: any): void {
    if (!this.server) return;
    this.server.to(`board:${boardId}`).emit('board:section_updated', {
      boardId,
      section,
    });
  }

  public broadcastSectionRemoved(boardId: string, sectionId: string): void {
    if (!this.server) return;
    this.server.to(`board:${boardId}`).emit('board:section_removed', {
      boardId,
      sectionId,
    });
  }
}
