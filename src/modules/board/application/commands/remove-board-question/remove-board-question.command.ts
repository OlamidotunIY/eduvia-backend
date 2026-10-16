export interface RemoveBoardQuestionPayload {
  boardId: string;
  boardQuestionId: string;
  correlationId?: string;
}

export class RemoveBoardQuestionCommand {
  constructor(public readonly payload: RemoveBoardQuestionPayload) {}
}
