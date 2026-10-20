import { BaseDomainEvent } from '@modules/shared';

class QuestionPublishedEvent extends BaseDomainEvent<QuestionPublishedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: QuestionPublishedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: QuestionPublishedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace QuestionPublishedEvent {
  export class Payload {
    constructor(public readonly questionId: string) {}
  }
}

export { QuestionPublishedEvent };
