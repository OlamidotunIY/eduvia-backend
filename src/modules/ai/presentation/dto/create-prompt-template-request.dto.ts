import { AiJobType } from '../../domain';

export class CreatePromptTemplateRequestDto {
  name: string;
  type: AiJobType;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isActive?: boolean;
}
