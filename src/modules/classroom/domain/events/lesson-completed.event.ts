import { BaseDomainEvent } from '@modules/shared';

class LessonCompletedEvent extends BaseDomainEvent<LessonCompletedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonCompletedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonCompletedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonCompletedEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly completedAt: Date,
    ) {}
  }
}

export { LessonCompletedEvent };
