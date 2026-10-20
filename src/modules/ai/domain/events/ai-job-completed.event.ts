import { BaseDomainEvent } from '@modules/shared/domain';

class AIJobCompletedEvent extends BaseDomainEvent<AIJobCompletedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AIJobCompletedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AIJobCompletedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AIJobCompletedEvent {
  export class Payload {
    constructor(
      public readonly jobId: string,
      public readonly type: string,
      public readonly output: Record<string, any>,
      public readonly tokensUsed: number | null,
      public readonly relatedEntityId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { AIJobCompletedEvent };
