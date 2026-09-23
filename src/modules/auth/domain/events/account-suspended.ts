import { BaseDomainEvent } from "@modules/shared";


class AccountSuspendedEvent extends BaseDomainEvent<
  AccountSuspendedEvent.Payload
> {
  constructor(
    aggregateId: string,
    payload: AccountSuspendedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AccountSuspendedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AccountSuspendedEvent {
  export class Payload {
    constructor(
      public readonly authAccountId: string,
      public readonly userId: string,
    ) {}
  }
}
export { AccountSuspendedEvent };
