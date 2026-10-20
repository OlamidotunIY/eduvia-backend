import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTeacherPerformanceQuery } from './get-teacher-performance.query';
import {
  IOrgAnalyticsSnapshotRepository,
  TeacherPerformanceStatProps,
} from '../../../domain';

@QueryHandler(GetTeacherPerformanceQuery)
export class GetTeacherPerformanceHandler
  implements IQueryHandler<GetTeacherPerformanceQuery, TeacherPerformanceStatProps[]>
{
  constructor(
    private readonly snapshotRepository: IOrgAnalyticsSnapshotRepository,
  ) {}

  async execute(
    query: GetTeacherPerformanceQuery,
  ): Promise<TeacherPerformanceStatProps[]> {
    const snapshot = await this.snapshotRepository.findLatestByOrg(query.orgId);
    if (!snapshot) {
      return [];
    }

    return snapshot.teacherPerformance.map((t) => t.toJSON());
  }
}
