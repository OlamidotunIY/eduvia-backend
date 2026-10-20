import { BaseDomainEvent } from '@modules/shared/domain';

class OrgApprovedEvent extends BaseDomainEvent<OrgApprovedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgApprovedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgApprovedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgApprovedEvent {
  export class Payload {
    constructor(
      public readonly orgId: string,
      public readonly approvedBy: string,
      public readonly reviewedAt: Date,
    ) {}
  }
}

export { OrgApprovedEvent };
