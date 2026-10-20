import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';

class AuthEmailVerifiedEvent extends BaseDomainEvent<AuthEmailVerifiedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AuthEmailVerifiedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AuthEmailVerifiedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AuthEmailVerifiedEvent {
  export class Payload {
    constructor(
      public readonly userId: string,
      public readonly email: string,
    ) {}
  }
}

export { AuthEmailVerifiedEvent };
