import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAiCostSummaryQuery } from './get-ai-cost-summary.query';
import { IAiJobRepository } from '../../../domain';
import { AiCostSummaryDto } from '../dto/ai-cost-summary.dto';

@QueryHandler(GetAiCostSummaryQuery)
export class GetAiCostSummaryHandler
  implements IQueryHandler<GetAiCostSummaryQuery, AiCostSummaryDto[]>
{
  constructor(private readonly jobRepository: IAiJobRepository) {}

  public async execute(
    _query: GetAiCostSummaryQuery,
  ): Promise<AiCostSummaryDto[]> {
    const summaries = await this.jobRepository.getCostSummaryByOrg();
    return summaries.map((s) => ({
      orgId: s.orgId,
      totalTokens: s.totalTokens,
      totalJobs: s.totalJobs,
    }));
  }
}
