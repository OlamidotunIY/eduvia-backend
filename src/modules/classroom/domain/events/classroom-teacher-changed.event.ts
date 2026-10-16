import { BaseDomainEvent } from '@modules/shared';

class ClassroomTeacherChangedEvent extends BaseDomainEvent<ClassroomTeacherChangedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ClassroomTeacherChangedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ClassroomTeacherChangedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ClassroomTeacherChangedEvent {
  export class Payload {
    constructor(
      public readonly classroomId: string,
      public readonly orgId: string,
      public readonly oldTeacherId: string,
      public readonly newTeacherId: string,
    ) {}
  }
}

export { ClassroomTeacherChangedEvent };
