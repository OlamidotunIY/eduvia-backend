import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';

class AuthSessionCreatedEvent extends BaseDomainEvent<
  AuthSessionCreatedEvent.Payload
> {
  constructor(
    aggregateId: string,
    payload: AuthSessionCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AuthSessionCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AuthSessionCreatedEvent {
  export class Payload {
    constructor(
      public readonly authAccountId: string
    ) {}
  }
}

export { AuthSessionCreatedEvent };
