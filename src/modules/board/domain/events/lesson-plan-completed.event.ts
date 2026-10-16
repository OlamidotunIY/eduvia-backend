import { BaseDomainEvent } from '@modules/shared';

class LessonPlanCompletedEvent extends BaseDomainEvent<LessonPlanCompletedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonPlanCompletedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonPlanCompletedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonPlanCompletedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly lessonId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { LessonPlanCompletedEvent };
