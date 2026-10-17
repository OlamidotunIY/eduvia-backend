export interface PublishQuestionPayload {
  questionId: string;
  correlationId?: string;
}

export class PublishQuestionCommand {
  constructor(public readonly payload: PublishQuestionPayload) {}
}
