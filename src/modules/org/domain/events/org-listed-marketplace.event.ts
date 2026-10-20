import { BaseDomainEvent } from '@modules/shared';

export class OrganizationListedOnMarketplaceEvent extends BaseDomainEvent<OrganizationListedOnMarketplaceEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrganizationListedOnMarketplaceEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrganizationListedOnMarketplaceEvent.name,
      payload,
      correlationId,
    });
  }
}

export namespace OrganizationListedOnMarketplaceEvent {
  export class Payload {
    constructor(public readonly orgId: string) {}
  }
}
