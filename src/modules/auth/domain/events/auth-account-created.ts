import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';

class AuthAccountCreatedEvent extends BaseDomainEvent<
  AuthAccountCreatedEvent.Payload
> {
  constructor(
    aggregateId: string,
    payload: AuthAccountCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AuthAccountCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AuthAccountCreatedEvent {
  export class Payload {
    constructor(
      public readonly authAccountId: string,
      public readonly preAuthToken: string,
      public readonly profileData: {
        email: string;
        firstName: string;
        lastName: string;
        userType: string;
      },
    ) {}
  }
}
export { AuthAccountCreatedEvent };
