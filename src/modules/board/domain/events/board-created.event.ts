import { BaseDomainEvent } from '@modules/shared';

class BoardCreatedEvent extends BaseDomainEvent<BoardCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: BoardCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: BoardCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace BoardCreatedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly lessonId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { BoardCreatedEvent };
