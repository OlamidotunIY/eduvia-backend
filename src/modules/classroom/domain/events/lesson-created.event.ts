import { BaseDomainEvent } from '@modules/shared';

class LessonCreatedEvent extends BaseDomainEvent<LessonCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonCreatedEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly classroomId: string,
      public readonly orgId: string,
      public readonly scheduledAt: Date,
    ) {}
  }
}

export { LessonCreatedEvent };
