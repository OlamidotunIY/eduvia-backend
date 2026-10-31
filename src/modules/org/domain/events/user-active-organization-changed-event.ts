import { BaseDomainEvent } from '@modules/shared';

class UserActiveOrganizationChangedEvent extends BaseDomainEvent<UserActiveOrganizationChangedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: UserActiveOrganizationChangedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId: String(aggregateId),
      eventName: UserActiveOrganizationChangedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace UserActiveOrganizationChangedEvent {
  export class Payload {
    constructor(
      public readonly userId: string,
      public readonly organizationId: string,
    ) {}
  }
}

export { UserActiveOrganizationChangedEvent };
