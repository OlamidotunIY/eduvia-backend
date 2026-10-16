import { BaseDomainEvent } from '@modules/shared';

class BoardLockedEvent extends BaseDomainEvent<BoardLockedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: BoardLockedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: BoardLockedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace BoardLockedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly lockedBy: string,
    ) {}
  }
}

export { BoardLockedEvent };
