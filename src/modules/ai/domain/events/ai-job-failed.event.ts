import { BaseDomainEvent } from '@modules/shared/domain';

class AIJobFailedEvent extends BaseDomainEvent<AIJobFailedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AIJobFailedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AIJobFailedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AIJobFailedEvent {
  export class Payload {
    constructor(
      public readonly jobId: string,
      public readonly type: string,
      public readonly errorMessage: string,
      public readonly relatedEntityId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { AIJobFailedEvent };
