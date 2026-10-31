import { BaseDomainEvent } from '@modules/shared';

class UserRegistrationCreatedEvent extends BaseDomainEvent<UserRegistrationCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: UserRegistrationCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId: String(aggregateId),
      eventName: UserRegistrationCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace UserRegistrationCreatedEvent {
  export class Payload {
    constructor(
      public readonly registrationRequestId: string,
      public readonly userId: string,
      public readonly email: string,
    ) {}
  }
}

export { UserRegistrationCreatedEvent };
