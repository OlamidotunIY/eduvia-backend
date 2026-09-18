import { BaseDomainEvent } from '@modules/shared';

class OrganizationSuspendedEvent extends BaseDomainEvent<OrganizationSuspendedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrganizationSuspendedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrganizationSuspendedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrganizationSuspendedEvent {
  export class Payload {
    constructor(
      public readonly organizationId: string,
      public readonly ownerId: string,
    ) {}
  }
}

export { OrganizationSuspendedEvent };
