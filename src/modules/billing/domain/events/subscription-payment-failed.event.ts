import { BaseDomainEvent } from '@modules/shared/domain';

class SubscriptionPaymentFailedEvent extends BaseDomainEvent<SubscriptionPaymentFailedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: SubscriptionPaymentFailedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: SubscriptionPaymentFailedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace SubscriptionPaymentFailedEvent {
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

export { SubscriptionPaymentFailedEvent };
