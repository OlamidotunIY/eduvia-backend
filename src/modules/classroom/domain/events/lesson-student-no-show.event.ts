import { BaseDomainEvent } from '@modules/shared';

class LessonStudentNoShowEvent extends BaseDomainEvent<LessonStudentNoShowEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonStudentNoShowEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonStudentNoShowEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonStudentNoShowEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly noShowAt: Date,
    ) {}
  }
}

export { LessonStudentNoShowEvent };
