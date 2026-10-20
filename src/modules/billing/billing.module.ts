import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { IBillingQueryPort } from '@modules/shared';

// Domain Ports & Repositories
import {
  IOrgBillingAccountRepository,
  ISubscriptionPlanRepository,
  IParentSubscriptionRepository,
  IBillingEventRepository,
  ISeatUsageRecordRepository,
  IPaymentGatewayPort,
} from './domain';

// Infrastructure Persistence
import {
  OrgBillingAccountMapper,
  PlanDiscountMapper,
  SubscriptionPlanMapper,
  ParentSubscriptionMapper,
  BillingEventMapper,
  SeatUsageRecordMapper,
  PrismaOrgBillingAccountRepository,
  PrismaSubscriptionPlanRepository,
  PrismaParentSubscriptionRepository,
  PrismaBillingEventRepository,
  PrismaSeatUsageRecordRepository,
} from './infrastructure/persistence';

// Infrastructure Services & Adapters
import {
  StripePaymentAdapter,
  BillingQueryAdapter,
} from './infrastructure/services';

// Infrastructure Messaging
import {
  BillingEventProcessor,
  BillingDunningScheduler,
} from './infrastructure/messaging';

// Application CQRS
import { COMMAND_HANDLERS } from './application/commands';
import { QUERY_HANDLERS } from './application/queries';

// Presentation
import {
  OrgBillingController,
  SubscriptionsController,
  WebhooksController,
} from './presentation/controllers';
import { BillingService } from './presentation/services';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'billing-events',
    }),
  ],
  controllers: [
    OrgBillingController,
    SubscriptionsController,
    WebhooksController,
  ],
  providers: [
    // Presentation Service
    BillingService,

    // CQRS Handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,

    // Mappers
    OrgBillingAccountMapper,
    PlanDiscountMapper,
    SubscriptionPlanMapper,
    ParentSubscriptionMapper,
    BillingEventMapper,
    SeatUsageRecordMapper,

    // Repositories
    {
      provide: IOrgBillingAccountRepository,
      useClass: PrismaOrgBillingAccountRepository,
    },
    {
      provide: ISubscriptionPlanRepository,
      useClass: PrismaSubscriptionPlanRepository,
    },
    {
      provide: IParentSubscriptionRepository,
      useClass: PrismaParentSubscriptionRepository,
    },
    {
      provide: IBillingEventRepository,
      useClass: PrismaBillingEventRepository,
    },
    {
      provide: ISeatUsageRecordRepository,
      useClass: PrismaSeatUsageRecordRepository,
    },

    // External Services & Ports
    {
      provide: IPaymentGatewayPort,
      useClass: StripePaymentAdapter,
    },
    {
      provide: IBillingQueryPort,
      useClass: BillingQueryAdapter,
    },
    StripePaymentAdapter,
    BillingQueryAdapter,

    // Messaging & Schedulers
    BillingEventProcessor,
    BillingDunningScheduler,
  ],
  exports: [
    IBillingQueryPort,
    IOrgBillingAccountRepository,
    ISubscriptionPlanRepository,
    IParentSubscriptionRepository,
    BillingService,
  ],
})
export class BillingModule {}