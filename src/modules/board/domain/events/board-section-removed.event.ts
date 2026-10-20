import { BaseDomainEvent } from '@modules/shared';

class BoardSectionRemovedEvent extends BaseDomainEvent<BoardSectionRemovedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: BoardSectionRemovedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: BoardSectionRemovedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace BoardSectionRemovedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly sectionId: string,
    ) {}
  }
}

export { BoardSectionRemovedEvent };
