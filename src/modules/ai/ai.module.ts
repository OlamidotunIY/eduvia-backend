import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { IAiQueryPort } from '@modules/shared';

// Domain Repositories & Ports
import {
  IAiJobRepository,
  IAiPromptTemplateRepository,
  IAiProviderPort,
  IAiProviderFactory,
} from './domain';

// Infrastructure Persistence
import {
  AiJobMapper,
  AiPromptTemplateMapper,
  PrismaAiJobRepository,
  PrismaAiPromptTemplateRepository,
} from './infrastructure/persistence';

// Infrastructure Services & Adapters
import {
  OpenAiAdapter,
  GeminiAdapter,
  AiProviderFactory,
  AiQueryAdapter,
} from './infrastructure/services';

// Infrastructure Messaging
import { AiEventProcessor } from './infrastructure/messaging';

// Application CQRS
import { COMMAND_HANDLERS } from './application/commands';
import { QUERY_HANDLERS } from './application/queries';

// Presentation
import {
  AiController,
  AiPromptTemplateController,
} from './presentation/controllers';
import { AiService } from './presentation/services';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'ai-events',
    }),
  ],
  controllers: [
    AiController,
    AiPromptTemplateController,
  ],
  providers: [
    // Presentation Service
    AiService,

    // CQRS Handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,

    // Mappers
    AiJobMapper,
    AiPromptTemplateMapper,

    // Repositories
    {
      provide: IAiJobRepository,
      useClass: PrismaAiJobRepository,
    },
    {
      provide: IAiPromptTemplateRepository,
      useClass: PrismaAiPromptTemplateRepository,
    },
    PrismaAiJobRepository,
    PrismaAiPromptTemplateRepository,

    // AI Providers & Ports
    OpenAiAdapter,
    GeminiAdapter,
    {
      provide: IAiProviderPort,
      useClass: OpenAiAdapter,
    },
    {
      provide: IAiProviderFactory,
      useClass: AiProviderFactory,
    },
    AiProviderFactory,

    // Shared Query Port
    {
      provide: IAiQueryPort,
      useClass: AiQueryAdapter,
    },
    AiQueryAdapter,

    // BullMQ Event Listeners
    AiEventProcessor,
  ],
  exports: [
    IAiQueryPort,
    AiQueryAdapter,
    IAiJobRepository,
    IAiPromptTemplateRepository,
  ],
})
export class AiModule {}