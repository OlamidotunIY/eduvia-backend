import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentChurnRiskQuery } from './get-student-churn-risk.query';
import {
  IOrgAnalyticsSnapshotRepository,
  StudentChurnRiskProps,
} from '../../../domain';

@QueryHandler(GetStudentChurnRiskQuery)
export class GetStudentChurnRiskHandler
  implements IQueryHandler<GetStudentChurnRiskQuery, StudentChurnRiskProps[]>
{
  constructor(
    private readonly snapshotRepository: IOrgAnalyticsSnapshotRepository,
  ) {}

  async execute(
    query: GetStudentChurnRiskQuery,
  ): Promise<StudentChurnRiskProps[]> {
    const snapshot = await this.snapshotRepository.findLatestByOrg(query.orgId);
    if (!snapshot) {
      return [];
    }

    return snapshot.studentChurnRisk.map((c) => c.toJSON());
  }
}
