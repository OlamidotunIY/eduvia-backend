import { BaseDomainEvent } from '@modules/shared/domain';

class ConversationReopenedEvent extends BaseDomainEvent<ConversationReopenedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ConversationReopenedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ConversationReopenedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ConversationReopenedEvent {
  export class Payload {
    constructor(
      public readonly conversationId: string,
      public readonly orgId: string,
      public readonly reopenedBy: string,
    ) {}
  }
}

export { ConversationReopenedEvent };
