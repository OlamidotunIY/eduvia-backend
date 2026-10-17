import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { IPlatformAdminQueryPort } from '@modules/shared';

// Domain Ports & Repositories
import {
  IPlatformAdminRepository,
  IPlatformAnnouncementRepository,
  IOrgApprovalRecordRepository,
  IPlatformMonitoringPort,
} from './domain';

// Infrastructure Persistence
import {
  PlatformAdminMapper,
  PlatformAnnouncementMapper,
  OrgApprovalRecordMapper,
  PrismaPlatformAdminRepository,
  PrismaPlatformAnnouncementRepository,
  PrismaOrgApprovalRecordRepository,
} from './infrastructure/persistence';

// Infrastructure Services & Adapters
import {
  PlatformMonitoringAdapter,
  PlatformFeatureGuard,
  PlatformAdminQueryAdapter,
} from './infrastructure/services';

// Infrastructure Messaging
import {
  AnnouncementEventProcessor,
  AnnouncementPublisherScheduler,
} from './infrastructure/messaging';

// Application CQRS
import { COMMAND_HANDLERS } from './application/commands';
import { QUERY_HANDLERS } from './application/queries';

// Presentation
import {
  PlatformAdminController,
  AnnouncementsAdminController,
} from './presentation/controllers';
import { PlatformAdminService } from './presentation/services';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'platform-admin-events',
    }),
  ],
  controllers: [
    PlatformAdminController,
    AnnouncementsAdminController,
  ],
  providers: [
    // Presentation Service
    PlatformAdminService,

    // CQRS Handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,

    // Mappers
    PlatformAdminMapper,
    PlatformAnnouncementMapper,
    OrgApprovalRecordMapper,

    // Repositories
    {
      provide: IPlatformAdminRepository,
      useClass: PrismaPlatformAdminRepository,
    },
    {
      provide: IPlatformAnnouncementRepository,
      useClass: PrismaPlatformAnnouncementRepository,
    },
    {
      provide: IOrgApprovalRecordRepository,
      useClass: PrismaOrgApprovalRecordRepository,
    },

    // External Services & Ports
    {
      provide: IPlatformMonitoringPort,
      useClass: PlatformMonitoringAdapter,
    },
    {
      provide: IPlatformAdminQueryPort,
      useClass: PlatformAdminQueryAdapter,
    },
    PlatformFeatureGuard,
    PlatformMonitoringAdapter,
    PlatformAdminQueryAdapter,

    // Messaging & Schedulers
    AnnouncementEventProcessor,
    AnnouncementPublisherScheduler,
  ],
  exports: [
    IPlatformAdminQueryPort,
    PlatformFeatureGuard,
    PlatformAdminService,
    IPlatformAdminRepository,
    IPlatformAnnouncementRepository,
    IOrgApprovalRecordRepository,
  ],
})
export class PlatformAdminModule {}