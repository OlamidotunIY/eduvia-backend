import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IRegistrationRequestRepository, RegistrationRequestId } from '../../domain';
import { RedisService } from '@modules/shared';

@WebSocketGateway({
  namespace: '/registration',
  cors: { origin: '*', credentials: true },
})
export class RegistrationGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly redis: RedisService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const registrationRequestId = client.handshake.auth?.registrationRequestId;
    const registrationContinuation = client.handshake.auth?.registrationContinuation;
    if (
      typeof registrationRequestId !== 'string' ||
      typeof registrationContinuation !== 'string'
    ) {
      client.disconnect(true);
      return;
    }

    const expectedContinuation = await this.redis.getClient().get(
      `auth:registration:continuation:${registrationRequestId}`,
    );
    if (!expectedContinuation || expectedContinuation !== registrationContinuation) {
      client.disconnect(true);
      return;
    }

    try {
      const request = await this.registrationRequestRepository.findById(
        RegistrationRequestId.from(registrationRequestId),
      );
      if (!request) {
        client.disconnect(true);
        return;
      }

      client.join(this.room(registrationRequestId));
      if (request.status === 'completed') {
        client.emit('registration:ready', { registrationRequestId });
      }
    } catch {
      client.disconnect(true);
    }
  }

  registrationReady(registrationRequestId: string): void {
    this.server?.to(this.room(registrationRequestId)).emit('registration:ready', {
      registrationRequestId,
    });
  }

  private room(registrationRequestId: string): string {
    return `registration:${registrationRequestId}`;
  }
}
