export interface UnpublishQuestionPayload {
  questionId: string;
  actor?: { role: string; userId?: string; orgId?: string };
}

export class UnpublishQuestionCommand {
  constructor(public readonly payload: UnpublishQuestionPayload) {}
}
