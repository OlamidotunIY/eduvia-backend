import { BaseDomainEvent } from '@modules/shared/domain';

class OrgBillingAccountCreatedEvent extends BaseDomainEvent<OrgBillingAccountCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgBillingAccountCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgBillingAccountCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgBillingAccountCreatedEvent {
  export class Payload {
    constructor(
      public readonly orgBillingAccountId: string,
      public readonly orgId: string,
      public readonly billingModel: string,
      public readonly planTier: string,
    ) {}
  }
}

export { OrgBillingAccountCreatedEvent };
