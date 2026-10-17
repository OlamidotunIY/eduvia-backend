import { BaseDomainEvent } from '@modules/shared/domain';

class OrgPlanUpgradedEvent extends BaseDomainEvent<OrgPlanUpgradedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgPlanUpgradedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgPlanUpgradedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgPlanUpgradedEvent {
  export class Payload {
    constructor(
      public readonly orgBillingAccountId: string,
      public readonly orgId: string,
      public readonly previousTier: string,
      public readonly newTier: string,
    ) {}
  }
}

export { OrgPlanUpgradedEvent };
