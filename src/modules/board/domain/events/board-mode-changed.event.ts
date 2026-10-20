import { BaseDomainEvent } from '@modules/shared';

class BoardModeChangedEvent extends BaseDomainEvent<BoardModeChangedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: BoardModeChangedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: BoardModeChangedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace BoardModeChangedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly previousMode: string,
      public readonly newMode: string,
      public readonly changedBy: string,
    ) {}
  }
}

export { BoardModeChangedEvent };
