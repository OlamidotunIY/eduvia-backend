import { BaseDomainEvent } from '@modules/shared/domain';

class OrgSuspendedEvent extends BaseDomainEvent<OrgSuspendedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgSuspendedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgSuspendedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgSuspendedEvent {
  export class Payload {
    constructor(
      public readonly orgId: string,
      public readonly suspendedBy: string,
      public readonly reason?: string,
    ) {}
  }
}

export { OrgSuspendedEvent };
