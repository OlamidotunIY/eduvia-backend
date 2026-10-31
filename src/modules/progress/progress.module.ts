import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  IProgressQueryPort,
} from '@modules/shared';
import { COMMAND_HANDLERS } from './application/commands';
import { QUERY_HANDLERS } from './application/queries';
import {
  ReportCommentMapper,
  LessonReportMapper,
  StudentProgressSummaryMapper,
  OrgAnalyticsSnapshotMapper,
} from './infrastructure/persistence/mappers';
import {
  ILessonReportRepository,
  IReportCommentRepository,
  IStudentProgressSummaryRepository,
  IOrgAnalyticsSnapshotRepository,
} from './domain/repository';
import {
  PrismaLessonReportRepository,
  PrismaReportCommentRepository,
  PrismaStudentProgressSummaryRepository,
  PrismaOrgAnalyticsSnapshotRepository,
} from './infrastructure/persistence/repository';
import { ProgressEventProcessor } from './infrastructure/messaging/listeners';
import { ProgressAnalyticsScheduler } from './infrastructure/messaging/scheduler';
import { ProgressQueryAdapter } from './infrastructure/services/progress-query.adapter';
import { ProgressController } from './presentation/controllers';
import { ProgressService } from './presentation/services';

const mappers = [
  ReportCommentMapper,
  LessonReportMapper,
  StudentProgressSummaryMapper,
  OrgAnalyticsSnapshotMapper,
];

const repositories = [
  PrismaLessonReportRepository,
  PrismaReportCommentRepository,
  PrismaStudentProgressSummaryRepository,
  PrismaOrgAnalyticsSnapshotRepository,
  {
    provide: ILessonReportRepository,
    useClass: PrismaLessonReportRepository,
  },
  {
    provide: IReportCommentRepository,
    useClass: PrismaReportCommentRepository,
  },
  {
    provide: IStudentProgressSummaryRepository,
    useClass: PrismaStudentProgressSummaryRepository,
  },
  {
    provide: IOrgAnalyticsSnapshotRepository,
    useClass: PrismaOrgAnalyticsSnapshotRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue(
      { name: 'progress-events' },
      { name: 'classroom-events' },
      { name: 'assessment-events' },
      { name: 'ai-events' },
    ),
  ],
  controllers: [ProgressController],
  providers: [
    AuthGuard,
    ProgressService,
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...mappers,
    ...repositories,
    ProgressEventProcessor,
    ProgressAnalyticsScheduler,
    ProgressQueryAdapter,
    {
      provide: IProgressQueryPort,
      useClass: ProgressQueryAdapter,
    },
  ],
  exports: [
    IProgressQueryPort,
    ProgressQueryAdapter,
  ],
})
export class ProgressModule {}
