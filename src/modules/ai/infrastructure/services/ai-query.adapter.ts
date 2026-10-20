import { Injectable } from '@nestjs/common';
import {
  IAiQueryPort,
  SharedAiJobDto,
  SharedAiPromptTemplateDto,
} from '@modules/shared';
import {
  IAiJobRepository,
  IAiPromptTemplateRepository,
  AiJobType,
} from '../../domain';

@Injectable()
export class AiQueryAdapter implements IAiQueryPort {
  constructor(
    private readonly jobRepository: IAiJobRepository,
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
  ) {}

  public async getJobById(jobId: string): Promise<SharedAiJobDto | null> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id.unpack(),
      type: job.type,
      status: job.status,
      outputPayload: job.outputPayload,
      tokensUsed: job.tokensUsed,
      relatedEntityId: job.relatedEntityId,
      orgId: job.orgId,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }

  public async getLatestCompletedJob(
    type: string,
    relatedEntityId: string,
  ): Promise<SharedAiJobDto | null> {
    const job = await this.jobRepository.findLatestCompleted(
      type as AiJobType,
      relatedEntityId,
    );
    if (!job) {
      return null;
    }

    return {
      id: job.id.unpack(),
      type: job.type,
      status: job.status,
      outputPayload: job.outputPayload,
      tokensUsed: job.tokensUsed,
      relatedEntityId: job.relatedEntityId,
      orgId: job.orgId,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }

  public async getActivePromptTemplate(
    type: string,
  ): Promise<SharedAiPromptTemplateDto | null> {
    const template = await this.promptTemplateRepository.findActiveByType(
      type as AiJobType,
    );
    if (!template) {
      return null;
    }

    return {
      id: template.id.unpack(),
      name: template.name,
      type: template.type,
      version: template.version,
      systemPrompt: template.systemPrompt,
      userPromptTemplate: template.userPromptTemplate,
      isActive: template.isActive,
    };
  }
}
