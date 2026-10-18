import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const client: Socket = host.switchToWs().getClient();

    let error: any;
    if (exception instanceof WsException) {
      error = exception.getError();
    } else if (exception instanceof Error) {
      error = {
        name: exception.name,
        message: exception.message,
      };
    } else {
      error = {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      };
    }

    client.emit('exception', { error });
  }
}
