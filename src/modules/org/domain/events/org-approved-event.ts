import { BaseDomainEvent } from '@modules/shared';

class OrganizationApprovedEvent extends BaseDomainEvent<OrganizationApprovedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrganizationApprovedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrganizationApprovedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrganizationApprovedEvent {
  export class Payload {
    constructor(
      public readonly organizationId: string,
      public readonly ownerId: string,
    ) {}
  }
}

export { OrganizationApprovedEvent };
