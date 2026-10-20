export interface UnpublishQuestionPayload {
  questionId: string;
}

export class UnpublishQuestionCommand {
  constructor(public readonly payload: UnpublishQuestionPayload) {}
}
