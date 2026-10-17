import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  AiPromptTemplate,
  AiPromptTemplateId,
  AiJobType,
} from '../../../domain';
import { AIPromptTemplate as PrismaAIPromptTemplate } from '@generated/prisma/client';

@Injectable()
export class AiPromptTemplateMapper
  implements IMapper<AiPromptTemplate, PrismaAIPromptTemplate>
{
  toDomain(record: PrismaAIPromptTemplate): AiPromptTemplate {
    return AiPromptTemplate.reconstitute({
      id: AiPromptTemplateId.from(record.id),
      name: record.name,
      type: record.type as AiJobType,
      version: record.version,
      systemPrompt: record.systemPrompt,
      userPromptTemplate: record.userPromptTemplate,
      isActive: record.isActive,
      createdAt: record.createdAt,
      deprecatedAt: record.deprecatedAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: AiPromptTemplate): PrismaAIPromptTemplate {
    return {
      id: entity.id.unpack(),
      name: entity.name,
      type: entity.type,
      version: entity.version,
      systemPrompt: entity.systemPrompt,
      userPromptTemplate: entity.userPromptTemplate,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      deprecatedAt: entity.deprecatedAt,
      updatedAt: entity.updatedAt,
    };
  }
}
