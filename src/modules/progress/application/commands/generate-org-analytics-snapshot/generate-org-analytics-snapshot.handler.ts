import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateOrgAnalyticsSnapshotCommand } from './generate-org-analytics-snapshot.command';
import { GenerateOrgAnalyticsSnapshotResult } from './generate-org-analytics-snapshot.result';
import {
  OrgAnalyticsSnapshot,
  IOrgAnalyticsSnapshotRepository,
  EnrollmentFunnelStat,
} from '../../../domain';

@CommandHandler(GenerateOrgAnalyticsSnapshotCommand)
export class GenerateOrgAnalyticsSnapshotHandler
  implements
    ICommandHandler<
      GenerateOrgAnalyticsSnapshotCommand,
      GenerateOrgAnalyticsSnapshotResult
    >
{
  constructor(
    private readonly snapshotRepository: IOrgAnalyticsSnapshotRepository,
  ) {}

  async execute(
    command: GenerateOrgAnalyticsSnapshotCommand,
  ): Promise<GenerateOrgAnalyticsSnapshotResult> {
    const { payload } = command;
    const snapshotDate = payload.snapshotDate ?? new Date();

    const snapshot = OrgAnalyticsSnapshot.create({
      orgId: payload.orgId,
      snapshotDate,
      totalActiveStudents: payload.totalActiveStudents ?? 0,
      totalActiveTeachers: payload.totalActiveTeachers ?? 0,
      totalLessonsThisMonth: payload.totalLessonsThisMonth ?? 0,
      totalLessonsLastMonth: payload.totalLessonsLastMonth ?? 0,
      avgLessonCompletionRate: payload.avgLessonCompletionRate ?? 0,
      avgReportSubmissionTimeHours: payload.avgReportSubmissionTimeHours ?? 0,
      teacherPerformance: payload.teacherPerformance || [],
      studentChurnRisk: payload.studentChurnRisk || [],
      funnelStats:
        payload.funnelStats ??
        EnrollmentFunnelStat.create({
          totalLeads: 0,
          trialLessonsBooked: 0,
          trialLessonsCompleted: 0,
          enrolledStudents: 0,
          conversionRate: 0,
        }),
    });

    await this.snapshotRepository.save(snapshot);

    return {
      snapshotId: snapshot.id.unpack(),
      orgId: snapshot.orgId,
      snapshotDate: snapshot.snapshotDate,
    };
  }
}
