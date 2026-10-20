import { BaseDomainEvent } from '@modules/shared';

class QuestionCreatedEvent extends BaseDomainEvent<QuestionCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: QuestionCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: QuestionCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace QuestionCreatedEvent {
  export class Payload {
    constructor(
      public readonly questionId: string,
      public readonly ownerType: string,
      public readonly ownerId: string | null,
      public readonly type: string,
      public readonly curriculumNodeId: string | null,
    ) {}
  }
}

export { QuestionCreatedEvent };
