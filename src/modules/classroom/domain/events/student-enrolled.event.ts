import { BaseDomainEvent } from '@modules/shared';

class StudentEnrolledInClassroomEvent extends BaseDomainEvent<StudentEnrolledInClassroomEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: StudentEnrolledInClassroomEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: StudentEnrolledInClassroomEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace StudentEnrolledInClassroomEvent {
  export class Payload {
    constructor(
      public readonly classroomId: string,
      public readonly studentId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { StudentEnrolledInClassroomEvent };
