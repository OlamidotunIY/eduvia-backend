export interface PublishQuestionPayload {
  questionId: string;
  actor?: { role: string; userId?: string; orgId?: string };
  correlationId?: string;
}

export class PublishQuestionCommand {
  constructor(public readonly payload: PublishQuestionPayload) {}
}
