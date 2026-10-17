import { BaseDomainEvent } from '@modules/shared/domain';

class SubscriptionPausedEvent extends BaseDomainEvent<SubscriptionPausedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: SubscriptionPausedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: SubscriptionPausedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace SubscriptionPausedEvent {
  export class Payload {
    constructor(
      public readonly subscriptionId: string,
      public readonly orgId: string,
      public readonly parentId: string,
      public readonly studentId: string,
      public readonly subjectId: string,
    ) {}
  }
}

export { SubscriptionPausedEvent };
