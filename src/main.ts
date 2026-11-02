import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { DomainExceptionFilter } from './modules/shared/infrastructure/http/filters/domain-exception.filters';
import { SocketIoAdapter } from './modules/websocket/adapters/socket-io.adapter';
import { Redis } from 'ioredis';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function allowedOrigins(): string[] {
  return (process.env['CORS_ORIGINS'] ?? 'https://app.eduvia.name.ng,https://app.eduvia.name.ng:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalFilters(new DomainExceptionFilter());

  app.enableCors({
    origin: allowedOrigins(),
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Correlation-Id'],
    exposedHeaders: ['X-Correlation-Id'],
    maxAge: 86400,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Eduvia API')
    .setDescription(
      'The HTTP API for Eduvia, the educational operating system for tutoring organizations.',
    )
    .setVersion(process.env['APP_VERSION'] ?? '1.0.0')
    .addServer(
      process.env['PUBLIC_API_URL'] ?? 'https://api.eduvia.name.ng',
      process.env['NODE_ENV'] === 'production'
        ? 'Production'
        : 'Local development',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Short-lived access token returned by login or refresh.',
      },
      'bearer',
    )
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
  });
  SwaggerModule.setup('docs', app, openApiDocument, {
    jsonDocumentUrl: 'openapi.json',
    yamlDocumentUrl: 'openapi.yaml',
    customSiteTitle: 'Eduvia API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

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
    const { ShareDBBackendService } =
      await import('./modules/board/infrastructure/sharedb/sharedb-backend.service');
    const shareDB = app.get(ShareDBBackendService);
    shareDB.attachToServer(app.getHttpServer());
  } catch {
    // Non-fatal if ShareDB service is mocked or optional in tests
  }

  app.enableShutdownHooks();
  await app.listen(process.env['PORT'] ?? 3000, '0.0.0.0');
}
void bootstrap();
