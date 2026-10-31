import { BaseDomainEvent } from '@modules/shared';

class UserRegistrationRequestedEvent extends BaseDomainEvent<UserRegistrationRequestedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: UserRegistrationRequestedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId: String(aggregateId),
      eventName: UserRegistrationRequestedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace UserRegistrationRequestedEvent {
  export class Payload {
    constructor(
      public readonly registrationRequestId: string,
      public readonly email: string,
      public readonly firstName: string,
      public readonly lastName: string,
      public readonly imageUrl: string | null,
      public readonly emailVerified: boolean,
      public readonly timezone: string,
    ) {}
  }
}

export { UserRegistrationRequestedEvent };
