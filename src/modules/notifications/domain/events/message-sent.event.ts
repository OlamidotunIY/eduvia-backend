import { BaseDomainEvent } from '@modules/shared/domain';

class MessageSentEvent extends BaseDomainEvent<MessageSentEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: MessageSentEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: MessageSentEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace MessageSentEvent {
  export class Payload {
    constructor(
      public readonly messageId: string,
      public readonly conversationId: string,
      public readonly senderId: string,
      public readonly content: string,
      public readonly attachmentUrl: string | null,
      public readonly sentAt: Date,
    ) {}
  }
}

export { MessageSentEvent };
