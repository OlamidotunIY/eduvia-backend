import { BaseDomainEvent } from '@modules/shared/domain';

class OrgReactivatedEvent extends BaseDomainEvent<OrgReactivatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgReactivatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgReactivatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgReactivatedEvent {
  export class Payload {
    constructor(
      public readonly orgId: string,
      public readonly reactivatedBy: string,
    ) {}
  }
}

export { OrgReactivatedEvent };
