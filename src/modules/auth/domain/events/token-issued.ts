import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';

class TokenIssuedEvent extends BaseDomainEvent<
  number,
  TokenIssuedEvent.Payload
> {
  constructor(
    aggregateId: number,
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
      public readonly authAccountId: number,
    ) {}
  }
}

export { TokenIssuedEvent };
