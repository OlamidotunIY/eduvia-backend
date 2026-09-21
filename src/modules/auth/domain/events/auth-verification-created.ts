import { VerificationType } from '../value-objects/verification-type.v0';
import { BaseDomainEvent } from '../../../shared/domain/events/domain-event';

class AuthVerificationCreatedEvent extends BaseDomainEvent<
  AuthVerificationCreatedEvent.Payload
> {
  constructor(
    aggregateId: string,
    payload: AuthVerificationCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AuthVerificationCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AuthVerificationCreatedEvent {
  export class Payload {
    constructor(
      public readonly verificationId: string,
      public readonly authAccountId: string,
      public readonly identifier: string,
      public readonly verificationType: VerificationType,
    ) {}
  }
}

export { AuthVerificationCreatedEvent };
