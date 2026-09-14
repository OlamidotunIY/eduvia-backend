import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';

class AuthAccountCreatedEvent extends BaseDomainEvent<
  number,
  AuthAccountCreatedEvent.Payload
> {
  constructor(
    aggregateId: number,
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
      public readonly authAccountId: number,
      public readonly userId: number,
      public readonly preAuthToken: string,
    ) {}
  }
}
export { AuthAccountCreatedEvent };
