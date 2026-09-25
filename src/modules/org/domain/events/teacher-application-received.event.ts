import { BaseDomainEvent } from '@modules/shared';

class TeacherApplicationReceivedEvent extends BaseDomainEvent<TeacherApplicationReceivedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: TeacherApplicationReceivedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: TeacherApplicationReceivedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TeacherApplicationReceivedEvent {
  export class Payload {
    constructor(
      public readonly applicationId: string,
      public readonly orgId: string,
      public readonly applicantUserId: string,
      public readonly appliedSubjects: string[],
    ) {}
  }
}

export { TeacherApplicationReceivedEvent };