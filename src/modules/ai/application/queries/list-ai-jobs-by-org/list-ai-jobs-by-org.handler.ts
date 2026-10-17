import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAiJobsByOrgQuery } from './list-ai-jobs-by-org.query';
import { IAiJobRepository } from '../../../domain';
import { AiJobDto } from '../dto/ai-job.dto';

export interface ListAiJobsResult {
  jobs: AiJobDto[];
  total: number;
}

@QueryHandler(ListAiJobsByOrgQuery)
export class ListAiJobsByOrgHandler
  implements IQueryHandler<ListAiJobsByOrgQuery, ListAiJobsResult>
{
  constructor(private readonly jobRepository: IAiJobRepository) {}

  public async execute(query: ListAiJobsByOrgQuery): Promise<ListAiJobsResult> {
    const [jobs, total] = await Promise.all([
      this.jobRepository.findByOrg(query.orgId, query.options),
      this.jobRepository.countByOrg(query.orgId, query.options),
    ]);

    return {
      jobs: jobs.map((job) => ({
        id: job.id.unpack(),
        type: job.type,
        status: job.status,
        inputPayload: job.inputPayload,
        outputPayload: job.outputPayload,
        provider: job.provider,
        model: job.model,
        promptVersion: job.promptVersion,
        tokensUsed: job.tokensUsed,
        errorMessage: job.errorMessage,
        relatedEntityId: job.relatedEntityId,
        relatedEntityType: job.relatedEntityType,
        orgId: job.orgId,
        requestedBy: job.requestedBy,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        updatedAt: job.updatedAt,
      })),
      total,
    };
  }
}
