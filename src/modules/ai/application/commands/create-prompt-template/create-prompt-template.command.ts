import { AiJobType } from '../../../domain';

export class CreatePromptTemplateCommand {
  constructor(
    public readonly params: {
      name: string;
      type: AiJobType;
      version: string;
      systemPrompt: string;
      userPromptTemplate: string;
      isActive?: boolean;
    },
  ) {}
}
