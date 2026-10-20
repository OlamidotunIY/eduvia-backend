import { BaseDomainEvent } from '@modules/shared/domain';

class LessonReportCreatedEvent extends BaseDomainEvent<LessonReportCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonReportCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonReportCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonReportCreatedEvent {
  export class Payload {
    constructor(
      public readonly reportId: string,
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly classroomId: string,
      public readonly teacherId: string,
      public readonly studentId: string,
    ) {}
  }
}

export { LessonReportCreatedEvent };
