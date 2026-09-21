import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';

class TokenIssuedEvent extends BaseDomainEvent<
  TokenIssuedEvent.Payload
> {
  constructor(
    aggregateId: string,
    payload: TokenIssuedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: TokenIssuedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TokenIssuedEvent {
  export class Payload {
    constructor(
      public readonly authAccountId: string,
    ) {}
  }
}

export { TokenIssuedEvent };
