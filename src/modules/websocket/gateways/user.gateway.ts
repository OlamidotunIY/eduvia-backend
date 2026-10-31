import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from '../filters';
import { WsJwtGuard } from '../guards';

@WebSocketGateway({
  namespace: '/user',
  cors: { origin: '*', credentials: true },
})
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UserGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client ${client.id} connected to /user`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected from /user`);
  }

  activeOrganizationChanged(userId: string, organizationId: string): void {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('user:active_organization_changed', {
      organizationId,
    });
  }
}
