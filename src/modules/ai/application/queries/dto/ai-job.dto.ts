export interface AiJobDto {
  id: string;
  type: string;
  status: string;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any> | null;
  provider: string;
  model: string;
  promptVersion: string;
  tokensUsed: number | null;
  errorMessage: string | null;
  relatedEntityId: string;
  relatedEntityType: string;
  orgId: string;
  requestedBy: string | null;
  createdAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
}
