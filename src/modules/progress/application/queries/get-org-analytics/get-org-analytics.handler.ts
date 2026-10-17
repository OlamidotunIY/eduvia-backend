import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrgAnalyticsQuery } from './get-org-analytics.query';
import { OrgAnalyticsDto } from './org-analytics.dto';
import {
  IOrgAnalyticsSnapshotRepository,
  OrgAnalyticsSnapshotNotFoundError,
} from '../../../domain';

@QueryHandler(GetOrgAnalyticsQuery)
export class GetOrgAnalyticsHandler
  implements IQueryHandler<GetOrgAnalyticsQuery, OrgAnalyticsDto>
{
  constructor(
    private readonly snapshotRepository: IOrgAnalyticsSnapshotRepository,
  ) {}

  async execute(query: GetOrgAnalyticsQuery): Promise<OrgAnalyticsDto> {
    const snapshot = query.date
      ? await this.snapshotRepository.findByOrgAndDate(query.orgId, query.date)
      : await this.snapshotRepository.findLatestByOrg(query.orgId);

    if (!snapshot) {
      throw new OrgAnalyticsSnapshotNotFoundError(query.orgId);
    }

    return {
      id: snapshot.id.unpack(),
      orgId: snapshot.orgId,
      snapshotDate: snapshot.snapshotDate,
      totalActiveStudents: snapshot.totalActiveStudents,
      totalActiveTeachers: snapshot.totalActiveTeachers,
      totalLessonsThisMonth: snapshot.totalLessonsThisMonth,
      totalLessonsLastMonth: snapshot.totalLessonsLastMonth,
      avgLessonCompletionRate: snapshot.avgLessonCompletionRate,
      avgReportSubmissionTimeHours: snapshot.avgReportSubmissionTimeHours,
      teacherPerformance: snapshot.teacherPerformance.map((t) => t.toJSON()),
      studentChurnRisk: snapshot.studentChurnRisk.map((c) => c.toJSON()),
      funnelStats: snapshot.funnelStats.toJSON(),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
