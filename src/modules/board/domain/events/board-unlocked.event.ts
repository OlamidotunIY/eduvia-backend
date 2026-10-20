import { BaseDomainEvent } from '@modules/shared';

class BoardUnlockedEvent extends BaseDomainEvent<BoardUnlockedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: BoardUnlockedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: BoardUnlockedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace BoardUnlockedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly unlockedBy: string,
    ) {}
  }
}

export { BoardUnlockedEvent };
