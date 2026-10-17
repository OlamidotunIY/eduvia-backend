import { BaseDomainEvent } from '@modules/shared/domain';

class OrgBillingSuspendedEvent extends BaseDomainEvent<OrgBillingSuspendedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgBillingSuspendedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgBillingSuspendedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgBillingSuspendedEvent {
  export class Payload {
    constructor(
      public readonly orgBillingAccountId: string,
      public readonly orgId: string,
      public readonly reason?: string,
    ) {}
  }
}

export { OrgBillingSuspendedEvent };
