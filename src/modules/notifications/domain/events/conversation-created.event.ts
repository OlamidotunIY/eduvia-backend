import { BaseDomainEvent } from '@modules/shared/domain';

class ConversationCreatedEvent extends BaseDomainEvent<ConversationCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ConversationCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ConversationCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ConversationCreatedEvent {
  export class Payload {
    constructor(
      public readonly conversationId: string,
      public readonly orgId: string,
      public readonly type: string,
      public readonly participants: string[],
      public readonly studentId: string | null,
      public readonly parentId: string | null,
      public readonly subject: string | null,
    ) {}
  }
}

export { ConversationCreatedEvent };
