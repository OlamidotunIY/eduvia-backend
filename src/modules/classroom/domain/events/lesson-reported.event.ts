import { BaseDomainEvent } from '@modules/shared';

class LessonReportedEvent extends BaseDomainEvent<LessonReportedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonReportedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonReportedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonReportedEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly reportedAt: Date,
    ) {}
  }
}

export { LessonReportedEvent };
