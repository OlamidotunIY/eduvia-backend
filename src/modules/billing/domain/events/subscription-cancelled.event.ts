import { BaseDomainEvent } from '@modules/shared/domain';

class SubscriptionCancelledEvent extends BaseDomainEvent<SubscriptionCancelledEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: SubscriptionCancelledEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: SubscriptionCancelledEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace SubscriptionCancelledEvent {
  export class Payload {
    constructor(
      public readonly subscriptionId: string,
      public readonly orgId: string,
      public readonly parentId: string,
      public readonly studentId: string,
      public readonly subjectId: string,
      public readonly cancelReason?: string,
    ) {}
  }
}

export { SubscriptionCancelledEvent };
