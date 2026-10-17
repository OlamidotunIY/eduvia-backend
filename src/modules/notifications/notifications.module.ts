import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { INotificationsQueryPort } from '@modules/shared';

// Domain Ports & Repositories
import {
  INotificationRepository,
  IConversationRepository,
  IMessageRepository,
  IDeviceTokenRepository,
  IPushNotificationPort,
  IEmailNotificationPort,
} from './domain';

// Infrastructure Persistence
import {
  NotificationMapper,
  ConversationMapper,
  MessageMapper,
  DeviceTokenMapper,
  PrismaNotificationRepository,
  PrismaConversationRepository,
  PrismaMessageRepository,
  PrismaDeviceTokenRepository,
} from './infrastructure/persistence';

// Infrastructure Services & Adapters
import {
  NotificationQueryAdapter,
  FcmPushAdapter,
  EmailNotificationAdapter,
} from './infrastructure/services';

// Infrastructure Messaging
import {
  NotificationEventProcessor,
  NotificationCleanupScheduler,
} from './infrastructure/messaging';

// Application CQRS
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Presentation
import {
  NotificationsController,
  ConversationsController,
} from './presentation/controllers';
import {
  NotificationsService,
  ConversationsService,
} from './presentation/services';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'notification-events',
    }),
  ],
  controllers: [NotificationsController, ConversationsController],
  providers: [
    // Presentation Services
    NotificationsService,
    ConversationsService,

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,

    // Mappers
    NotificationMapper,
    ConversationMapper,
    MessageMapper,
    DeviceTokenMapper,

    // Repositories
    {
      provide: INotificationRepository,
      useClass: PrismaNotificationRepository,
    },
    {
      provide: IConversationRepository,
      useClass: PrismaConversationRepository,
    },
    {
      provide: IMessageRepository,
      useClass: PrismaMessageRepository,
    },
    {
      provide: IDeviceTokenRepository,
      useClass: PrismaDeviceTokenRepository,
    },

    // External Ports & Adapters
    {
      provide: IPushNotificationPort,
      useClass: FcmPushAdapter,
    },
    {
      provide: IEmailNotificationPort,
      useClass: EmailNotificationAdapter,
    },
    {
      provide: INotificationsQueryPort,
      useClass: NotificationQueryAdapter,
    },

    // Messaging Processor & Schedulers
    NotificationEventProcessor,
    NotificationCleanupScheduler,
  ],
  exports: [INotificationsQueryPort, INotificationRepository],
})
export class NotificationsModule {}