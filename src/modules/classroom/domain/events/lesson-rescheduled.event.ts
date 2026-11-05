import { BaseDomainEvent } from '@modules/shared/domain';

class LessonRescheduledEvent extends BaseDomainEvent<LessonRescheduledEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonRescheduledEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonRescheduledEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonRescheduledEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly classroomId: string,
      public readonly orgId: string,
      public readonly previousScheduledAt: Date,
      public readonly newScheduledAt: Date,
      public readonly durationMins: number,
      public readonly teacherId: string,
    ) {}
  }
}

export { LessonRescheduledEvent };
