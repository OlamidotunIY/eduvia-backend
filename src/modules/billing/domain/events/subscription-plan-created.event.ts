import { BaseDomainEvent } from '@modules/shared/domain';

class SubscriptionPlanCreatedEvent extends BaseDomainEvent<SubscriptionPlanCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: SubscriptionPlanCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: SubscriptionPlanCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace SubscriptionPlanCreatedEvent {
  export class Payload {
    constructor(
      public readonly planId: string,
      public readonly orgId: string,
      public readonly subjectId: string,
      public readonly name: string,
      public readonly priceAmount: number,
      public readonly currency: string,
      public readonly billingInterval: string,
      public readonly lessonsPerInterval: number,
    ) {}
  }
}

export { SubscriptionPlanCreatedEvent };
