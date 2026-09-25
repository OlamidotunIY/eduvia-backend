import { BaseDomainEvent } from '@modules/shared';

class TeacherApplicationRejectedEvent extends BaseDomainEvent<TeacherApplicationRejectedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: TeacherApplicationRejectedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: TeacherApplicationRejectedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TeacherApplicationRejectedEvent {
  export class Payload {
    constructor(
      public readonly applicationId: string,
      public readonly orgId: string,
      public readonly reason: string | null,
    ) {}
  }
}

export { TeacherApplicationRejectedEvent };