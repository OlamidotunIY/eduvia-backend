import { BaseDomainEvent } from '@modules/shared/domain';

class SubscriptionResumedEvent extends BaseDomainEvent<SubscriptionResumedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: SubscriptionResumedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: SubscriptionResumedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace SubscriptionResumedEvent {
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

export { SubscriptionResumedEvent };
