import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActivePromptTemplateQuery } from './get-active-prompt-template.query';
import { IAiPromptTemplateRepository } from '../../../domain';
import { AiPromptTemplateDto } from '../dto/ai-prompt-template.dto';

@QueryHandler(GetActivePromptTemplateQuery)
export class GetActivePromptTemplateHandler
  implements
    IQueryHandler<GetActivePromptTemplateQuery, AiPromptTemplateDto | null>
{
  constructor(
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
  ) {}

  public async execute(
    query: GetActivePromptTemplateQuery,
  ): Promise<AiPromptTemplateDto | null> {
    const template = await this.promptTemplateRepository.findActiveByType(
      query.type,
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
      createdAt: template.createdAt,
      deprecatedAt: template.deprecatedAt,
      updatedAt: template.updatedAt,
    };
  }
}
