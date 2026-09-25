import { BaseDomainEvent } from '@modules/shared';

class OrganizationCreatedEvent extends BaseDomainEvent<OrganizationCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrganizationCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrganizationCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrganizationCreatedEvent {
  export class Payload {
    constructor(
      public readonly organizationId: string,
      public readonly ownerId: string,
      public readonly name: string,
      public readonly slug: string,
      public readonly contactEmail: string,
    ) {}
  }
}

export { OrganizationCreatedEvent };
