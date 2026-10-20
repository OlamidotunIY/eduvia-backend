import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';
import { UserType } from '../value-objects/user-type.v0';

class UserCreatedEvent extends BaseDomainEvent<
  UserCreatedEvent.Payload
> {
  constructor(
    aggregateId: string,
    payload: UserCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: UserCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace UserCreatedEvent {
  export class Payload {
    constructor(
      public readonly userId: string,
      public readonly userType: UserType,
      public readonly email: string,
      public readonly passwordHash: string,
    ) {}
  }
}

export { UserCreatedEvent };
