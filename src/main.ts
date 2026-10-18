import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { DomainExceptionFilter } from './modules/shared/infrastructure/http/filters/domain-exception.filters';
import { SocketIoAdapter } from './modules/websocket/adapters/socket-io.adapter';
import { Redis } from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalFilters(
    new DomainExceptionFilter(),
  );

  // Wire Socket.io adapter with Redis pub/sub if REDIS_URL is present
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const pubClient = new Redis(redisUrl);
      const subClient = pubClient.duplicate();
      app.useWebSocketAdapter(new SocketIoAdapter(app, pubClient, subClient));
    } catch {
      app.useWebSocketAdapter(new SocketIoAdapter(app));
    }
  } else {
    app.useWebSocketAdapter(new SocketIoAdapter(app));
  }

  // Attach ShareDB OT server to /board-sync on the HTTP server
  try {
    const { ShareDBBackendService } = await import(
      './modules/board/infrastructure/sharedb/sharedb-backend.service'
    );
    const shareDB = app.get(ShareDBBackendService);
    shareDB.attachToServer(app.getHttpServer());
  } catch {
    // Non-fatal if ShareDB service is mocked or optional in tests
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
