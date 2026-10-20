import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelAiJobCommand } from './cancel-ai-job.command';
import { IAiJobRepository, AiJobNotFoundError } from '../../../domain';
import { AiJobDto } from '../../queries/dto/ai-job.dto';

@CommandHandler(CancelAiJobCommand)
export class CancelAiJobHandler
  implements ICommandHandler<CancelAiJobCommand, AiJobDto>
{
  constructor(private readonly jobRepository: IAiJobRepository) {}

  public async execute(command: CancelAiJobCommand): Promise<AiJobDto> {
    const job = await this.jobRepository.findById(command.id);
    if (!job) {
      throw new AiJobNotFoundError(command.id);
    }

    job.cancel();
    await this.jobRepository.save(job);

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
