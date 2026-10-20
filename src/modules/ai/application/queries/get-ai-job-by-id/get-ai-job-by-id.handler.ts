import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAiJobByIdQuery } from './get-ai-job-by-id.query';
import { IAiJobRepository, AiJobNotFoundError } from '../../../domain';
import { AiJobDto } from '../dto/ai-job.dto';

@QueryHandler(GetAiJobByIdQuery)
export class GetAiJobByIdHandler
  implements IQueryHandler<GetAiJobByIdQuery, AiJobDto>
{
  constructor(private readonly jobRepository: IAiJobRepository) {}

  public async execute(query: GetAiJobByIdQuery): Promise<AiJobDto> {
    const job = await this.jobRepository.findById(query.id);
    if (!job) {
      throw new AiJobNotFoundError(query.id);
    }

    return {
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
    };
  }
}
