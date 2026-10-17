import { BaseDomainEvent } from '@modules/shared/domain';

class OrgRejectedEvent extends BaseDomainEvent<OrgRejectedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgRejectedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgRejectedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgRejectedEvent {
  export class Payload {
    constructor(
      public readonly orgId: string,
      public readonly rejectedBy: string,
      public readonly reason?: string,
    ) {}
  }
}

export { OrgRejectedEvent };
