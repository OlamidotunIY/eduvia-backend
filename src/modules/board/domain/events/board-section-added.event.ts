import { BaseDomainEvent } from '@modules/shared';

class BoardSectionAddedEvent extends BaseDomainEvent<BoardSectionAddedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: BoardSectionAddedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: BoardSectionAddedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace BoardSectionAddedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly sectionId: string,
      public readonly type: string,
      public readonly position: number,
      public readonly createdBy: string,
    ) {}
  }
}

export { BoardSectionAddedEvent };
