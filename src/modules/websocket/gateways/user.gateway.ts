import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IUserQueryPort } from '@modules/shared';
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

  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const auth = await this.wsJwtGuard.authenticate(client);
      const user = await this.userQueryPort.getUserById(auth.userId);

      if (user?.activeOrganizationId) {
        client.emit('user:active_organization_changed', {
          organizationId: user.activeOrganizationId,
        });
      }

      this.logger.log(`Client ${client.id} connected to /user`);
    } catch {
      client.disconnect(true);
    }
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
