import { BaseDomainEvent } from '@modules/shared';

class LessonScheduledEvent extends BaseDomainEvent<LessonScheduledEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonScheduledEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonScheduledEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonScheduledEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly scheduledAt: Date,
      public readonly teacherId: string,
    ) {}
  }
}

export { LessonScheduledEvent };
