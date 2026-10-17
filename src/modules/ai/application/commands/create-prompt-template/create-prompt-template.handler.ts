import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePromptTemplateCommand } from './create-prompt-template.command';
import {
  AiPromptTemplate,
  IAiPromptTemplateRepository,
  AiPromptTemplateInvariantError,
} from '../../../domain';
import { AiPromptTemplateDto } from '../../queries/dto/ai-prompt-template.dto';

@CommandHandler(CreatePromptTemplateCommand)
export class CreatePromptTemplateHandler
  implements ICommandHandler<CreatePromptTemplateCommand, AiPromptTemplateDto>
{
  constructor(
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
  ) {}

  public async execute(
    command: CreatePromptTemplateCommand,
  ): Promise<AiPromptTemplateDto> {
    const { params } = command;

    const existing = await this.promptTemplateRepository.findByTypeAndVersion(
      params.type,
      params.version,
    );
    if (existing) {
      throw new AiPromptTemplateInvariantError(
        `A prompt template for type '${params.type}' with version '${params.version}' already exists.`,
      );
    }

    const template = AiPromptTemplate.create({
      name: params.name,
      type: params.type,
      version: params.version,
      systemPrompt: params.systemPrompt,
      userPromptTemplate: params.userPromptTemplate,
      isActive: params.isActive,
    });

    await this.promptTemplateRepository.save(template);

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
