import { BaseDomainEvent } from '@modules/shared';

class BoardSectionUpdatedEvent extends BaseDomainEvent<BoardSectionUpdatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: BoardSectionUpdatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: BoardSectionUpdatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace BoardSectionUpdatedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly sectionId: string,
      public readonly content: string,
    ) {}
  }
}

export { BoardSectionUpdatedEvent };
