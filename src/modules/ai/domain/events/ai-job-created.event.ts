import { BaseDomainEvent } from '@modules/shared/domain';

class AIJobCreatedEvent extends BaseDomainEvent<AIJobCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AIJobCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AIJobCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AIJobCreatedEvent {
  export class Payload {
    constructor(
      public readonly jobId: string,
      public readonly type: string,
      public readonly relatedEntityId: string,
      public readonly relatedEntityType: string,
      public readonly orgId: string,
      public readonly requestedBy: string | null,
    ) {}
  }
}

export { AIJobCreatedEvent };
