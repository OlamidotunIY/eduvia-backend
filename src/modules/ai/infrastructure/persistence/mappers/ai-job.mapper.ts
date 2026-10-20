import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  AiJob,
  AiJobId,
  AiJobType,
  AiJobStatus,
  AiProvider,
  AiEntityType,
} from '../../../domain';
import { AIJob as PrismaAIJob } from '@generated/prisma/client';

@Injectable()
export class AiJobMapper implements IMapper<AiJob, PrismaAIJob> {
  toDomain(record: PrismaAIJob): AiJob {
    const inputPayload =
      typeof record.inputPayload === 'object' && record.inputPayload !== null
        ? (record.inputPayload as Record<string, any>)
        : {};

    const outputPayload =
      typeof record.outputPayload === 'object' && record.outputPayload !== null
        ? (record.outputPayload as Record<string, any>)
        : null;

    return AiJob.reconstitute({
      id: AiJobId.from(record.id),
      type: record.type as AiJobType,
      status: record.status as AiJobStatus,
      inputPayload,
      outputPayload,
      provider: record.provider as AiProvider,
      model: record.model,
      promptVersion: record.promptVersion,
      tokensUsed: record.tokensUsed,
      errorMessage: record.errorMessage,
      relatedEntityId: record.relatedEntityId,
      relatedEntityType: record.relatedEntityType as AiEntityType,
      orgId: record.orgId,
      requestedBy: record.requestedBy,
      createdAt: record.createdAt,
      completedAt: record.completedAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: AiJob): PrismaAIJob {
    return {
      id: entity.id.unpack(),
      type: entity.type,
      status: entity.status,
      inputPayload: entity.inputPayload,
      outputPayload: entity.outputPayload,
      provider: entity.provider,
      model: entity.model,
      promptVersion: entity.promptVersion,
      tokensUsed: entity.tokensUsed,
      errorMessage: entity.errorMessage,
      relatedEntityId: entity.relatedEntityId,
      relatedEntityType: entity.relatedEntityType,
      orgId: entity.orgId,
      requestedBy: entity.requestedBy,
      createdAt: entity.createdAt,
      completedAt: entity.completedAt,
      updatedAt: entity.updatedAt,
    };
  }
}
