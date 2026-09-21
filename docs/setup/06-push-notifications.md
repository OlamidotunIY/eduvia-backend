# Setup Guide — Push Notifications (Firebase Cloud Messaging)

> Full setup for push notifications using Firebase Admin SDK (FCM v1 HTTP API) in NestJS.

---

## Architecture Decision

Eduvia uses **Firebase Cloud Messaging (FCM)** via the **Firebase Admin SDK** for push notifications on iOS and Android. The mobile apps (React Native) use `@react-native-firebase/messaging` to receive notifications.

**Delivery strategy:**
1. First attempt: WebSocket delivery via Socket.io (user is online)
2. If user is offline or WS fails: FCM push notification
3. Critical events (lesson cancelled, payment failed): send both WS + FCM simultaneously

FCM tokens are stored per device (one user can have multiple devices). Stale tokens are removed automatically when FCM returns `messaging/registration-token-not-registered`.

---

## 1. Install Dependencies

```bash
pnpm add firebase-admin
```

---

## 2. Firebase Admin Initialization

```typescript
// src/modules/shared/infrastructure/firebase/firebase.module.ts

import { Module, Global } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { FCMService } from './fcm.service';

@Global()
@Module({
  providers: [FirebaseAdminService, FCMService],
  exports: [FCMService],
})
export class FirebaseModule {}
```

```typescript
// src/modules/shared/infrastructure/firebase/firebase-admin.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { App } from 'firebase-admin/app';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App;

  onModuleInit(): void {
    // Option A: Service account JSON file (recommended for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
    // Option B: Inline JSON string env var (Docker / CI environments)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
    // Option C: Application Default Credentials (Google Cloud environment)
    else {
      this.app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    this.logger.log('Firebase Admin SDK initialized');
  }

  getApp(): App {
    return this.app;
  }

  getMessaging(): admin.messaging.Messaging {
    return admin.messaging(this.app);
  }
}
```

---

## 3. FCM Service

```typescript
// src/modules/shared/infrastructure/firebase/fcm.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { IDeviceTokenRepository } from '@modules/notifications';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>; // FCM data payload — string values only
  imageUrl?: string;
  badge?: number;                 // iOS badge count
}

@Injectable()
export class FCMService {
  private readonly logger = new Logger(FCMService.name);

  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly deviceTokenRepository: IDeviceTokenRepository,
  ) {}

  // Send to a single user (all their active devices)
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<void> {
    const tokens = await this.deviceTokenRepository.findActiveTokens(userId);

    if (!tokens.length) return; // User has no registered devices

    await this.sendToTokens(
      tokens.map((t) => t.token),
      payload,
      userId,
    );
  }

  // Send to multiple specific tokens
  async sendToTokens(
    tokens: string[],
    payload: PushNotificationPayload,
    userId?: string,
  ): Promise<void> {
    if (!tokens.length) return;

    const messaging = this.firebaseAdmin.getMessaging();

    // FCM v1 HTTP API supports up to 500 tokens per multicast
    const BATCH_SIZE = 500;
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);

      const message: admin.messaging.MulticastMessage = {
        tokens: batch,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: {
          ...payload.data,
          // All FCM data values must be strings
          badge: String(payload.badge ?? 0),
        },
        apns: {
          // iOS specific
          payload: {
            aps: {
              badge: payload.badge,
              sound: 'default',
              'content-available': 1,   // allow background processing
            },
          },
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'eduvia_default',  // must be registered in the Android app
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);

      this.logger.debug(
        `FCM batch sent: ${response.successCount} success, ${response.failureCount} failures`,
      );

      // Remove stale tokens (device unregistered from FCM)
      if (response.failureCount > 0) {
        const staleTokens: string[] = [];
        response.responses.forEach((resp, index) => {
          if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
            staleTokens.push(batch[index]);
          }
        });

        if (staleTokens.length && userId) {
          await this.deviceTokenRepository.deactivateTokens(staleTokens, userId);
          this.logger.log(`Deactivated ${staleTokens.length} stale FCM tokens for user ${userId}`);
        }
      }
    }
  }

  // Send to a FCM topic (e.g., for platform-wide announcements)
  async sendToTopic(topic: string, payload: PushNotificationPayload): Promise<void> {
    const messaging = this.firebaseAdmin.getMessaging();

    await messaging.send({
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });
  }
}
```

---

## 4. BullMQ Notification Worker (Push Delivery)

```typescript
// src/modules/notifications/application/workers/notification.worker.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { FCMService } from '@modules/shared';
import { NotificationsGateway } from '@modules/websocket';
import { INotificationRepository } from '../../domain/repository/notification.repository';
import { Notification } from '../../domain/model/Notification';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';
import { EmailService } from '../../infrastructure/email/email.service';

@Processor('notification-events')
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    private readonly fcm: FCMService,
    private readonly wsGateway: NotificationsGateway,
    private readonly notificationRepository: INotificationRepository,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { recipientId, type, title, body, data, channels } = job.data.payload;

    // 1. Persist the in-app notification record
    const notification = Notification.create({
      id: NotificationId.create(),
      recipientId,
      type,
      title,
      body,
      data: data ?? {},
      channel: channels ?? 'all',
      correlationId: job.data.correlationId,
    });

    await this.notificationRepository.save(notification);

    // 2. Real-time WebSocket delivery (in-app)
    this.wsGateway.sendToUser(recipientId, {
      id: notification.getId(),
      type,
      title,
      body,
      data,
      createdAt: new Date().toISOString(),
    });

    // 3. FCM push (for offline users)
    await this.fcm.sendToUser(recipientId, { title, body, data });

    // 4. Email (for high-importance events)
    const emailEvents = [
      'lesson_scheduled', 'lesson_cancelled', 'report_submitted',
      'subscription_payment_failed', 'account_verification',
    ];

    if (emailEvents.includes(type)) {
      await this.emailService.send({
        to: job.data.payload.recipientEmail,
        template: type,
        data: { title, body, ...data },
      });
    }

    notification.markDelivered();
    await this.notificationRepository.save(notification);
  }
}
```

---

## 5. Device Token Registration Endpoint

```typescript
// src/modules/notifications/presentation/controllers/device-token.controller.ts

import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth';
import { CurrentUser } from '@modules/auth';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDeviceTokenCommand, DeactivateDeviceTokenCommand } from '../../application/commands';

class RegisterTokenDto {
  token: string;
  platform: 'ios' | 'android';
}

@Controller('devices/tokens')
@UseGuards(JwtAuthGuard)
export class DeviceTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async register(
    @CurrentUser() user: { userId: string },
    @Body() dto: RegisterTokenDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new RegisterDeviceTokenCommand({
        userId: user.userId,
        token: dto.token,
        platform: dto.platform,
        correlationId: crypto.randomUUID(),
      }),
    );
  }

  @Delete(':token')
  async deregister(
    @CurrentUser() user: { userId: string },
    @Param('token') token: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeactivateDeviceTokenCommand({ userId: user.userId, token }),
    );
  }
}
```

---

## 6. React Native Client Setup

```typescript
// mobile/src/services/push-notifications.ts

import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiClient } from './api-client';

export async function setupPushNotifications(userId: string): Promise<void> {
  // 1. Request permission (iOS)
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return;
  }

  // 2. Get FCM token
  const token = await messaging().getToken();

  // 3. Register with backend
  await apiClient.post('/devices/tokens', {
    token,
    platform: Platform.OS,
  });

  // 4. Listen for token refresh (FCM rotates tokens)
  messaging().onTokenRefresh(async (newToken) => {
    await apiClient.post('/devices/tokens', {
      token: newToken,
      platform: Platform.OS,
    });
  });

  // 5. Handle foreground notifications
  messaging().onMessage(async (remoteMessage) => {
    // Show in-app notification banner
    console.log('Foreground push:', remoteMessage);
  });

  // 6. Handle background / quit state tap
  messaging().onNotificationOpenedApp((remoteMessage) => {
    // Navigate to relevant screen based on remoteMessage.data.type
  });
}

// On logout: deregister the token
export async function removePushToken(token: string): Promise<void> {
  await apiClient.delete(`/devices/tokens/${encodeURIComponent(token)}`);
}
```

---

## 7. Android Channel Setup (in React Native)

```typescript
// mobile/android/app/src/main/AndroidManifest.xml
// Add inside <application>:
// <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id"
//            android:value="eduvia_default" />

// Create the channel programmatically (run once on app start):
import notifee from '@notifee/react-native';

async function createDefaultChannel() {
  await notifee.createChannel({
    id: 'eduvia_default',
    name: 'Eduvia Notifications',
    importance: notifee.AndroidImportance.HIGH,
    sound: 'default',
  });
}
```

---

## 8. Environment Variables

```env
# Option A: path to service account JSON file
FIREBASE_SERVICE_ACCOUNT_PATH=/run/secrets/firebase-service-account.json

# Option B: inline JSON string (CI/CD / Docker secrets)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Firebase project config
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```
