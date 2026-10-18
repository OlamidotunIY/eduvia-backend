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
  namespace: '/lesson',
  cors: { origin: '*', credentials: true },
})
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class LessonGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LessonGateway.name);

  handleConnection(client: Socket): void {
    const userId = client.auth?.userId || client.auth?.sub;
    this.logger.log(`Client ${client.id} connected to /lesson (User: ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected from /lesson`);
  }

  @SubscribeMessage('lesson:join')
  async handleJoinLesson(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lessonId: string },
  ): Promise<{ status: 'ok' } | { error: string }> {
    if (!data?.lessonId) {
      return { error: 'lessonId is required' };
    }

    const room = `lesson:${data.lessonId}`;
    client.join(room);

    const userId = client.auth?.userId || client.auth?.sub;
    this.server.to(room).emit('lesson:participant_joined', {
      lessonId: data.lessonId,
      userId,
      joinedAt: new Date().toISOString(),
    });

    return { status: 'ok' };
  }

  @SubscribeMessage('lesson:leave')
  handleLeaveLesson(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lessonId: string },
  ): { status: 'ok' } {
    if (data?.lessonId) {
      const room = `lesson:${data.lessonId}`;
      client.leave(room);

      const userId = client.auth?.userId || client.auth?.sub;
      this.server.to(room).emit('lesson:participant_left', {
        lessonId: data.lessonId,
        userId,
        leftAt: new Date().toISOString(),
      });
    }
    return { status: 'ok' };
  }

  public broadcastMeetLink(lessonId: string, meetLink: string): void {
    if (!this.server) return;
    this.server.to(`lesson:${lessonId}`).emit('lesson:meet_link_ready', {
      lessonId,
      meetLink,
    });
  }

  public broadcastStatusChange(lessonId: string, status: string): void {
    if (!this.server) return;
    this.server.to(`lesson:${lessonId}`).emit('lesson:status_changed', {
      lessonId,
      status,
      updatedAt: new Date().toISOString(),
    });
  }
}
