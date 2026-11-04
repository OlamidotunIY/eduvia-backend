import { BaseDomainEvent } from '@modules/shared';

class InitialActiveOrganizationRequestedEvent extends BaseDomainEvent<InitialActiveOrganizationRequestedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: InitialActiveOrganizationRequestedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId: String(aggregateId),
      eventName: InitialActiveOrganizationRequestedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace InitialActiveOrganizationRequestedEvent {
  export class Payload {
    constructor(
      public readonly userId: string,
      public readonly organizationId: string,
    ) {}
  }
}

export { InitialActiveOrganizationRequestedEvent };
