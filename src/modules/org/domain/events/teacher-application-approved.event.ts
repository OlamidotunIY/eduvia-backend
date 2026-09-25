import { BaseDomainEvent } from '@modules/shared';

class TeacherApplicationApprovedEvent extends BaseDomainEvent<TeacherApplicationApprovedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: TeacherApplicationApprovedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: TeacherApplicationApprovedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TeacherApplicationApprovedEvent {
  export class Payload {
    constructor(
      public readonly applicationId: string,
      public readonly orgId: string,
      public readonly applicantUserId: string,
      public readonly approvedSubjects: string[],
    ) {}
  }
}

export { TeacherApplicationApprovedEvent };