import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeprecatePromptTemplateCommand } from './deprecate-prompt-template.command';
import {
  IAiPromptTemplateRepository,
  AiPromptTemplateNotFoundError,
} from '../../../domain';
import { AiPromptTemplateDto } from '../../queries/dto/ai-prompt-template.dto';

@CommandHandler(DeprecatePromptTemplateCommand)
export class DeprecatePromptTemplateHandler
  implements ICommandHandler<DeprecatePromptTemplateCommand, AiPromptTemplateDto>
{
  constructor(
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
  ) {}

  public async execute(
    command: DeprecatePromptTemplateCommand,
  ): Promise<AiPromptTemplateDto> {
    const template = await this.promptTemplateRepository.findById(command.id);
    if (!template) {
      throw new AiPromptTemplateNotFoundError(command.id);
    }

    template.deprecate();
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
