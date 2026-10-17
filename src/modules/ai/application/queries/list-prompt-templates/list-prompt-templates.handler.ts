import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPromptTemplatesQuery } from './list-prompt-templates.query';
import { IAiPromptTemplateRepository } from '../../../domain';
import { AiPromptTemplateDto } from '../dto/ai-prompt-template.dto';

@QueryHandler(ListPromptTemplatesQuery)
export class ListPromptTemplatesHandler
  implements IQueryHandler<ListPromptTemplatesQuery, AiPromptTemplateDto[]>
{
  constructor(
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
  ) {}

  public async execute(
    query: ListPromptTemplatesQuery,
  ): Promise<AiPromptTemplateDto[]> {
    const templates = await this.promptTemplateRepository.findFiltered(
      query.filter,
    );

    return templates.map((t) => ({
      id: t.id.unpack(),
      name: t.name,
      type: t.type,
      version: t.version,
      systemPrompt: t.systemPrompt,
      userPromptTemplate: t.userPromptTemplate,
      isActive: t.isActive,
      createdAt: t.createdAt,
      deprecatedAt: t.deprecatedAt,
      updatedAt: t.updatedAt,
    }));
  }
}
