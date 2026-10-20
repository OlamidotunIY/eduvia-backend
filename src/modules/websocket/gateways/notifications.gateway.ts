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
  namespace: '/notifications',
  cors: { origin: '*', credentials: true },
})
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket): void {
    const userId = client.auth?.userId || client.auth?.sub;
    this.logger.log(`Client ${client.id} connected to /notifications (User: ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected from /notifications`);
  }

  @SubscribeMessage('notification:mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ): Promise<{ status: string }> {
    const userId = client.auth?.userId || client.auth?.sub;
    this.logger.log(
      `User ${userId} marked notification ${data?.notificationId} as read`,
    );

    client.emit('notification:marked_read', {
      notificationId: data?.notificationId,
      readAt: new Date().toISOString(),
    });

    return { status: 'ok' };
  }

  public sendToUser(userId: string, notification: Record<string, any>): void {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  public sendToOrg(
    orgId: string,
    event: string,
    payload: Record<string, any>,
  ): void {
    if (!this.server) return;
    this.server.to(`org:${orgId}`).emit(event, payload);
  }

  public updateUnreadCount(userId: string, count: number): void {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('notification:count', {
      unreadCount: count,
    });
  }
}
