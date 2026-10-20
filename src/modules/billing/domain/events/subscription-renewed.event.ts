import { BaseDomainEvent } from '@modules/shared/domain';

class SubscriptionRenewedEvent extends BaseDomainEvent<SubscriptionRenewedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: SubscriptionRenewedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: SubscriptionRenewedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace SubscriptionRenewedEvent {
  export class Payload {
    constructor(
      public readonly subscriptionId: string,
      public readonly orgId: string,
      public readonly parentId: string,
      public readonly studentId: string,
      public readonly subjectId: string,
      public readonly newPeriodEnd: Date,
    ) {}
  }
}

export { SubscriptionRenewedEvent };
