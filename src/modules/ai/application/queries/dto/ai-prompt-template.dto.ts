export interface AiPromptTemplateDto {
  id: string;
  name: string;
  type: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isActive: boolean;
  createdAt: Date;
  deprecatedAt: Date | null;
  updatedAt: Date;
}
