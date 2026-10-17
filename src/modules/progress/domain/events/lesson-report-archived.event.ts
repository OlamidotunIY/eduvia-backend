import { BaseDomainEvent } from '@modules/shared/domain';

class LessonReportArchivedEvent extends BaseDomainEvent<LessonReportArchivedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonReportArchivedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonReportArchivedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonReportArchivedEvent {
  export class Payload {
    constructor(
      public readonly reportId: string,
      public readonly orgId: string,
      public readonly archivedAt: Date,
    ) {}
  }
}

export { LessonReportArchivedEvent };
