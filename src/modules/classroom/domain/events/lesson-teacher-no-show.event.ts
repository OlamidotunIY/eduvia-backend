import { BaseDomainEvent } from '@modules/shared';

class LessonTeacherNoShowEvent extends BaseDomainEvent<LessonTeacherNoShowEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonTeacherNoShowEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonTeacherNoShowEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonTeacherNoShowEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly noShowAt: Date,
      public readonly markedBy: string,
    ) {}
  }
}

export { LessonTeacherNoShowEvent };
