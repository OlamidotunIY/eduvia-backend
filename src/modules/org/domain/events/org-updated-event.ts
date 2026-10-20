import { BaseDomainEvent } from '@modules/shared';

class OrganizationUpdatedEvent extends BaseDomainEvent<OrganizationUpdatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrganizationUpdatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrganizationUpdatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrganizationUpdatedEvent {
  export class Payload {
    constructor(
      public readonly organisationId: string,
      public readonly changedFields: Record<string, unknown>,
    ) {}
  }
}

export { OrganizationUpdatedEvent };
