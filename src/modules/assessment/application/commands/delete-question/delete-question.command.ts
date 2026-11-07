export interface DeleteQuestionPayload {
  questionId: string;
  actor?: { role: string; userId?: string; orgId?: string };
}

export class DeleteQuestionCommand {
  constructor(public readonly payload: DeleteQuestionPayload) {}
}
