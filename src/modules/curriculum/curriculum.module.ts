import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService, RedisService, AuthGuard } from '@modules/shared';

const CommandHandlers: any[] = [];
const QueryHandlers: any[] = [];
const EventProcessors: any[] = [];
const Mappers: any[] = [];
const PortBindings: any[] = [];
const Services: any[] = [];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: 'curriculum-events' }),
  ],
  controllers: [],
  providers: [
    PrismaService,
    RedisService,
    AuthGuard,
    ...Services,
    ...Mappers,
    ...PortBindings,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventProcessors,
  ],
  exports: [
    // Export ONLY shared query port tokens and adapters implementing shared ports
  ],
})
export class CurriculumModule {}