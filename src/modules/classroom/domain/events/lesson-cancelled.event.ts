import { BaseDomainEvent } from '@modules/shared';

class LessonCancelledEvent extends BaseDomainEvent<LessonCancelledEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonCancelledEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonCancelledEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonCancelledEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly reason: string,
      public readonly cancelledBy: string,
    ) {}
  }
}

export { LessonCancelledEvent };
