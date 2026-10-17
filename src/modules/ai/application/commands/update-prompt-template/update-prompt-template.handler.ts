import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePromptTemplateCommand } from './update-prompt-template.command';
import {
  IAiPromptTemplateRepository,
  AiPromptTemplateNotFoundError,
} from '../../../domain';
import { AiPromptTemplateDto } from '../../queries/dto/ai-prompt-template.dto';

@CommandHandler(UpdatePromptTemplateCommand)
export class UpdatePromptTemplateHandler
  implements ICommandHandler<UpdatePromptTemplateCommand, AiPromptTemplateDto>
{
  constructor(
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
  ) {}

  public async execute(
    command: UpdatePromptTemplateCommand,
  ): Promise<AiPromptTemplateDto> {
    const { params } = command;

    const template = await this.promptTemplateRepository.findById(params.id);
    if (!template) {
      throw new AiPromptTemplateNotFoundError(params.id);
    }

    template.updateTemplate({
      name: params.name,
      systemPrompt: params.systemPrompt,
      userPromptTemplate: params.userPromptTemplate,
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
