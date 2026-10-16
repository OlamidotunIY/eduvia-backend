import { BaseDomainEvent } from '@modules/shared';

class StudentRemovedFromClassroomEvent extends BaseDomainEvent<StudentRemovedFromClassroomEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: StudentRemovedFromClassroomEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: StudentRemovedFromClassroomEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace StudentRemovedFromClassroomEvent {
  export class Payload {
    constructor(
      public readonly classroomId: string,
      public readonly studentId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { StudentRemovedFromClassroomEvent };
