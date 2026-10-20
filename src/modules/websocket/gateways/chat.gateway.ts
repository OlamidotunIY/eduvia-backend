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
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  handleConnection(client: Socket): void {
    const userId = client.auth?.userId || client.auth?.sub;
    this.logger.log(`Client ${client.id} connected to /chat (User: ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected from /chat`);
  }

  @SubscribeMessage('chat:join')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ): { status: 'ok' } {
    if (data?.conversationId) {
      client.join(`conversation:${data.conversationId}`);
    }
    return { status: 'ok' };
  }

  @SubscribeMessage('chat:leave')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ): { status: 'ok' } {
    if (data?.conversationId) {
      client.leave(`conversation:${data.conversationId}`);
    }
    return { status: 'ok' };
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ): void {
    if (!data?.conversationId) return;

    const userId = client.auth?.userId || client.auth?.sub;
    client.to(`conversation:${data.conversationId}`).emit('chat:user_typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: data.isTyping,
    });
  }

  public broadcastMessage(
    conversationId: string,
    message: Record<string, any>,
  ): void {
    if (!this.server) return;
    this.server
      .to(`conversation:${conversationId}`)
      .emit('chat:new_message', message);
  }

  public sendDirectMessage(
    recipientUserId: string,
    message: Record<string, any>,
  ): void {
    if (!this.server) return;
    this.server.to(`user:${recipientUserId}`).emit('chat:direct_message', message);
  }
}
