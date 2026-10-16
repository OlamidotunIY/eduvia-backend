import { BaseDomainEvent } from '@modules/shared';

class QuestionRemovedFromBoardEvent extends BaseDomainEvent<QuestionRemovedFromBoardEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: QuestionRemovedFromBoardEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: QuestionRemovedFromBoardEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace QuestionRemovedFromBoardEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly boardQuestionId: string,
      public readonly questionId: string,
    ) {}
  }
}

export { QuestionRemovedFromBoardEvent };
