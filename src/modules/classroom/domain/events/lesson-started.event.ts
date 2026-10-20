import { BaseDomainEvent } from '@modules/shared';

class LessonStartedEvent extends BaseDomainEvent<LessonStartedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonStartedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonStartedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonStartedEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly meetLink?: string | null,
    ) {}
  }
}

export { LessonStartedEvent };
