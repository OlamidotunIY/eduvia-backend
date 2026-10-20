import { BaseDomainEvent } from '@modules/shared/domain';

class ConversationClosedEvent extends BaseDomainEvent<ConversationClosedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ConversationClosedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ConversationClosedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ConversationClosedEvent {
  export class Payload {
    constructor(
      public readonly conversationId: string,
      public readonly orgId: string,
      public readonly closedBy: string,
    ) {}
  }
}

export { ConversationClosedEvent };
