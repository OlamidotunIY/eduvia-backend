# Setup Guide — WebSocket (Socket.io + Redis Adapter)

> Full production setup for real-time communication in Eduvia using Socket.io with the Redis adapter for horizontal scaling.

---

## Architecture Decision

Eduvia uses **Socket.io** with the **`@socket.io/redis-adapter`** for WebSocket. This enables:
- Multiple NestJS instances to share rooms and broadcast across instances via Redis pub/sub
- Namespaced connections for domain isolation (`/lesson`, `/board`, `/notifications`, `/chat`)
- Room-based targeted delivery without maintaining server-side subscription lists in memory

**Why not raw WebSocket?** Socket.io provides: automatic reconnection, room management, namespace isolation, event acknowledgement, and fallback transports — all critical for a mobile-first product.

---

## 1. Install Dependencies

```bash
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io @socket.io/redis-adapter
pnpm add -D @types/socket.io
```

---

## 2. Create the WebSocket Module

```typescript
// src/modules/websocket/websocket.module.ts

import { Module, Global } from '@nestjs/common';
import { WebSocketAdapterModule } from './websocket-adapter.module';
import { LessonGateway } from './gateways/lesson.gateway';
import { BoardGateway } from './gateways/board.gateway';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WsExceptionFilter } from './filters/ws-exception.filter';

@Global()
@Module({
  providers: [
    LessonGateway,
    BoardGateway,
    NotificationsGateway,
    ChatGateway,
    WsJwtGuard,
    WsExceptionFilter,
  ],
  exports: [
    LessonGateway,
    NotificationsGateway,
  ],
})
export class WebSocketModule {}
```

---

## 3. Configure the Redis Adapter on App Bootstrap

```typescript
// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './websocket/adapters/socket-io.adapter';
import { Redis } from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Wire the Socket.io adapter with Redis pub/sub
  const pubClient = new Redis(process.env.REDIS_URL!);
  const subClient = pubClient.duplicate();

  app.useWebSocketAdapter(
    new SocketIoAdapter(app, pubClient, subClient),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

```typescript
// src/websocket/adapters/socket-io.adapter.ts

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { INestApplication } from '@nestjs/common';

export class SocketIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplication,
    private readonly pubClient: Redis,
    private readonly subClient: Redis,
  ) {
    super(app);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
        credentials: true,
      },
      transports: ['websocket'],   // WebSocket only — no long-polling on production
      pingTimeout: 20000,
      pingInterval: 10000,
    });

    server.adapter(this.adapterConstructor);

    return server;
  }
}
```

---

## 4. JWT Authentication Guard for WebSocket

```typescript
// src/websocket/guards/ws-jwt.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface WsAuthPayload {
  sub: string;        // authAccountId
  userId: string;
  userType: string;
  scope: string;
  orgId?: string;
  deviceId?: string;
}

declare module 'socket.io' {
  interface Socket {
    auth: WsAuthPayload;
  }
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    // Token comes from the handshake auth object: socket({ auth: { token: '...' } })
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) throw new WsException('Missing authentication token');

    try {
      const payload = await this.jwtService.verifyAsync<WsAuthPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      client.auth = payload;  // attach to socket for downstream use

      // Auto-join the user's personal room for targeted delivery
      client.join(`user:${payload.userId}`);

      return true;
    } catch {
      throw new WsException('Invalid or expired token');
    }
  }
}
```

---

## 5. Gateway Pattern — One Gateway Per Namespace

### /notifications Namespace

```typescript
// src/websocket/gateways/notifications.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  UseGuards,
  UseFilters,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
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
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  // Runs AFTER the WsJwtGuard — guard is applied at the gateway level
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected to /notifications: ${client.id}`);
    // user:{userId} room is joined in WsJwtGuard — no extra action needed
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected from /notifications: ${client.id}`);
  }

  @SubscribeMessage('notification:mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ): Promise<void> {
    // Dispatch to command handler via QueryBus/CommandBus
    // ...
    // Emit updated count back to the user's personal room
    this.server.to(`user:${client.auth.userId}`).emit('notification:count', {
      unreadCount: 0, // fetch from cache
    });
  }

  // Called programmatically from other parts of the system (e.g., BullMQ worker)
  sendToUser(userId: string, notification: object): void {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  sendToOrg(orgId: string, event: string, payload: object): void {
    this.server.to(`org:${orgId}`).emit(event, payload);
  }
}
```

### /lesson Namespace

```typescript
// src/websocket/gateways/lesson.gateway.ts

import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, UseGuards, UseFilters,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { WsExceptionFilter } from '../filters/ws-exception.filter';

@WebSocketGateway({ namespace: '/lesson' })
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class LessonGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket): void {}
  handleDisconnect(client: Socket): void {
    // Clean up any lesson rooms the client was in
  }

  @SubscribeMessage('lesson:join')
  async handleJoinLesson(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lessonId: string },
  ): Promise<{ status: 'ok' } | { error: string }> {
    // Validate user has access to this lesson
    // e.g. check if userId is teacher or enrolled student in lessonId
    const hasAccess = await this.validateLessonAccess(
      client.auth.userId,
      data.lessonId,
    );

    if (!hasAccess) return { error: 'Access denied' };

    client.join(`lesson:${data.lessonId}`);
    return { status: 'ok' };
  }

  @SubscribeMessage('lesson:leave')
  handleLeaveLesson(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lessonId: string },
  ): void {
    client.leave(`lesson:${data.lessonId}`);
  }

  // Called by BullMQ worker after meet link is generated
  broadcastMeetLink(lessonId: string, meetLink: string): void {
    this.server.to(`lesson:${lessonId}`).emit('lesson:meet_link_ready', {
      lessonId,
      meetLink,
    });
  }

  // Called by lesson lifecycle command handlers
  broadcastStatusChange(lessonId: string, status: string): void {
    this.server.to(`lesson:${lessonId}`).emit('lesson:status_changed', {
      lessonId,
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  private async validateLessonAccess(userId: string, lessonId: string): Promise<boolean> {
    // Inject a read service / query here to check access
    return true;
  }
}
```

---

## 6. Emitting from BullMQ Workers (Sending Events Server → Client)

```typescript
// Pattern: inject the gateway into a BullMQ worker and call emit methods

// src/modules/classroom/application/events/classroom.worker.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LessonGateway } from '@modules/websocket';
import { NotificationsGateway } from '@modules/websocket';

@Processor('classroom-events')
export class ClassroomEventWorker extends WorkerHost {
  constructor(
    private readonly lessonGateway: LessonGateway,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'LessonStartedEvent': {
        const { lessonId, meetLink } = job.data.payload;
        // Push meet link to all participants in the lesson room
        this.lessonGateway.broadcastMeetLink(lessonId, meetLink);
        break;
      }

      case 'LessonCompletedEvent': {
        const { lessonId } = job.data.payload;
        this.lessonGateway.broadcastStatusChange(lessonId, 'COMPLETED');
        break;
      }

      case 'LessonReportedEvent': {
        const { parentId, studentName, lessonId } = job.data.payload;
        // Push in-app notification to parent
        this.notificationsGateway.sendToUser(parentId, {
          type: 'report_submitted',
          title: 'Lesson Report Ready',
          body: `${studentName}'s lesson report is available`,
          data: { lessonId },
        });
        break;
      }
    }
  }
}
```

---

## 7. Exception Filter for WebSocket

```typescript
// src/websocket/filters/ws-exception.filter.ts

import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const client: Socket = host.switchToWs().getClient();

    const error =
      exception instanceof WsException
        ? exception.getError()
        : { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' };

    client.emit('exception', { error });
  }
}
```

---

## 8. Client-Side Connection Pattern (React Native)

```typescript
// Mobile client — how to connect from React Native

import { io, Socket } from 'socket.io-client';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL; // e.g. 'https://api.eduvia.com'

// Create namespace connections
const notificationsSocket: Socket = io(`${BASE_URL}/notifications`, {
  transports: ['websocket'],
  auth: { token: accessToken },     // JWT access token
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

const lessonSocket: Socket = io(`${BASE_URL}/lesson`, {
  transports: ['websocket'],
  auth: { token: accessToken },
  autoConnect: false,
});

// Connect when user is authenticated
notificationsSocket.connect();

// Listen for notifications
notificationsSocket.on('notification:new', (notification) => {
  // update notification store
});

// Join a lesson room
lessonSocket.connect();
lessonSocket.emit('lesson:join', { lessonId: 'xxx' }, (response) => {
  if (response.error) console.error(response.error);
});

lessonSocket.on('lesson:meet_link_ready', ({ meetLink }) => {
  // open meet link in browser/webview
});

// Handle token refresh — reconnect with new token
function reconnectWithNewToken(newToken: string) {
  [notificationsSocket, lessonSocket].forEach((socket) => {
    socket.auth = { token: newToken };
    socket.disconnect();
    socket.connect();
  });
}
```

---

## 9. Environment Variables

```env
# .env
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:8081,https://app.eduvia.com
JWT_ACCESS_SECRET=your-secret-here
```
