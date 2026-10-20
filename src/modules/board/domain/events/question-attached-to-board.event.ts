import { BaseDomainEvent } from '@modules/shared';

class QuestionAttachedToBoardEvent extends BaseDomainEvent<QuestionAttachedToBoardEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: QuestionAttachedToBoardEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: QuestionAttachedToBoardEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace QuestionAttachedToBoardEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly boardQuestionId: string,
      public readonly questionId: string,
      public readonly mode: string,
      public readonly position: number,
    ) {}
  }
}

export { QuestionAttachedToBoardEvent };
