import { BaseDomainEvent } from '@modules/shared/domain';

class LessonReportSubmittedEvent extends BaseDomainEvent<LessonReportSubmittedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonReportSubmittedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonReportSubmittedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonReportSubmittedEvent {
  export class Payload {
    constructor(
      public readonly reportId: string,
      public readonly lessonId: string,
      public readonly studentId: string,
      public readonly orgId: string,
      public readonly teacherId: string,
      public readonly submittedAt: Date,
    ) {}
  }
}

export { LessonReportSubmittedEvent };
