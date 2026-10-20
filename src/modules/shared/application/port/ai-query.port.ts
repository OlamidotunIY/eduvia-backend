export interface SharedAiJobDto {
  id: string;
  type: string;
  status: string;
  outputPayload: Record<string, any> | null;
  tokensUsed: number | null;
  relatedEntityId: string;
  orgId: string;
  createdAt: Date;
  completedAt: Date | null;
}

export interface SharedAiPromptTemplateDto {
  id: string;
  name: string;
  type: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isActive: boolean;
}

export abstract class IAiQueryPort {
  public abstract getJobById(jobId: string): Promise<SharedAiJobDto | null>;

  public abstract getLatestCompletedJob(
    type: string,
    relatedEntityId: string,
  ): Promise<SharedAiJobDto | null>;

  public abstract getActivePromptTemplate(
    type: string,
  ): Promise<SharedAiPromptTemplateDto | null>;
}
