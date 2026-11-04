import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { INestApplicationContext, Logger } from '@nestjs/common';

export class SocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIoAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(
    appOrHttpServer: INestApplicationContext | any,
    pubClient?: Redis | null,
    subClient?: Redis | null,
  ) {
    super(appOrHttpServer);
    if (pubClient && subClient) {
      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Redis adapter attached to Socket.io for horizontal scaling');
    }
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const allowedOrigins = (process.env.CORS_ORIGINS ??
      'https://app.eduvia.name.ng,https://app.eduvia.name.ng:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 20000,
      pingInterval: 10000,
    });

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}
