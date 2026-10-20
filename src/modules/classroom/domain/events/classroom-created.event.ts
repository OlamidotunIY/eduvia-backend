import { BaseDomainEvent } from '@modules/shared';

class ClassroomCreatedEvent extends BaseDomainEvent<ClassroomCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ClassroomCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ClassroomCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ClassroomCreatedEvent {
  export class Payload {
    constructor(
      public readonly classroomId: string,
      public readonly orgId: string,
      public readonly teacherId: string,
      public readonly subjectId: string,
    ) {}
  }
}

export { ClassroomCreatedEvent };
