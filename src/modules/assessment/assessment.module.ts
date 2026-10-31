import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  IAssessmentQueryPort,
  RedisService,
} from '@modules/shared';
import { COMMAND_HANDLERS } from './application/commands';
import { QUERY_HANDLERS } from './application/queries';
import {
  QuestionOptionMapper,
  QuestionMapper,
  MarkingItemMapper,
  AssessmentMapper,
  MasteryHistoryEntryMapper,
  MasteryRecordMapper,
} from './infrastructure/persistence/mappers';
import {
  IQuestionRepository,
  IAssessmentRepository,
  IMarkingItemRepository,
  IMasteryRecordRepository,
} from './domain/repository';
import {
  PrismaQuestionRepository,
  PrismaAssessmentRepository,
  PrismaMarkingItemRepository,
  PrismaMasteryRecordRepository,
} from './infrastructure/persistence/repository';
import {
  AssessmentEventProcessor,
  AssessmentFinalizedProcessor,
} from './infrastructure/messaging/listeners';
import { AssessmentQueryAdapter } from './infrastructure/services/assessment-query.adapter';
import {
  QuestionController,
  AssessmentController,
  MasteryController,
} from './presentation/controllers';
import { AssessmentService } from './presentation/services';

const mappers = [
  QuestionOptionMapper,
  QuestionMapper,
  MarkingItemMapper,
  AssessmentMapper,
  MasteryHistoryEntryMapper,
  MasteryRecordMapper,
];

const repositories = [
  PrismaQuestionRepository,
  PrismaAssessmentRepository,
  PrismaMarkingItemRepository,
  PrismaMasteryRecordRepository,
  {
    provide: IQuestionRepository,
    useClass: PrismaQuestionRepository,
  },
  {
    provide: IAssessmentRepository,
    useClass: PrismaAssessmentRepository,
  },
  {
    provide: IMarkingItemRepository,
    useClass: PrismaMarkingItemRepository,
  },
  {
    provide: IMasteryRecordRepository,
    useClass: PrismaMasteryRecordRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue(
      { name: 'assessment-events' },
      { name: 'classroom-events' },
      { name: 'progress-events' },
    ),
  ],
  controllers: [
    QuestionController,
    AssessmentController,
    MasteryController,
  ],
  providers: [
    RedisService,
    AuthGuard,
    AssessmentService,
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...mappers,
    ...repositories,
    AssessmentEventProcessor,
    AssessmentFinalizedProcessor,
    {
      provide: IAssessmentQueryPort,
      useClass: AssessmentQueryAdapter,
    },
  ],
  exports: [
    IQuestionRepository,
    IAssessmentRepository,
    IMarkingItemRepository,
    IMasteryRecordRepository,
    IAssessmentQueryPort,
    AssessmentService,
  ],
})
export class AssessmentModule {}
