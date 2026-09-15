import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';
import { UserType } from '../value-objects/user-type.v0';

class UserUpdatedEvent extends BaseDomainEvent<
  UserUpdatedEvent.Payload
> {
  constructor(
    aggregateId: string,
    payload: UserUpdatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: UserUpdatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace UserUpdatedEvent {
  export class Payload {
    constructor(
      public readonly userId: string,
      public readonly userType: UserType,
      public readonly email: string,
    ) {}
  }
}

export { UserUpdatedEvent };
