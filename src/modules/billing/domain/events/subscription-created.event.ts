import { BaseDomainEvent } from '@modules/shared/domain';

class SubscriptionCreatedEvent extends BaseDomainEvent<SubscriptionCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: SubscriptionCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: SubscriptionCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace SubscriptionCreatedEvent {
  export class Payload {
    constructor(
      public readonly subscriptionId: string,
      public readonly orgId: string,
      public readonly planId: string,
      public readonly parentId: string,
      public readonly studentId: string,
      public readonly subjectId: string,
      public readonly provider: string,
      public readonly effectivePriceAmount: number,
      public readonly currentPeriodStart: Date,
      public readonly currentPeriodEnd: Date,
    ) {}
  }
}

export { SubscriptionCreatedEvent };
