import { BaseDomainEvent } from '@modules/shared';

class TeacherApplicationAutoRejectedEvent extends BaseDomainEvent<TeacherApplicationAutoRejectedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: TeacherApplicationAutoRejectedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: TeacherApplicationAutoRejectedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TeacherApplicationAutoRejectedEvent {
  export class Payload {
    constructor(
      public readonly applicationId: string,
      public readonly orgId: string,
      public readonly reason: string,
    ) {}
  }
}

export { TeacherApplicationAutoRejectedEvent };