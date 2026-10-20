export class UpdatePromptTemplateCommand {
  constructor(
    public readonly params: {
      id: string;
      name?: string;
      systemPrompt?: string;
      userPromptTemplate?: string;
    },
  ) {}
}
