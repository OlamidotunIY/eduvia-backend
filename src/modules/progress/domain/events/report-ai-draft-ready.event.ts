import { BaseDomainEvent } from '@modules/shared';

class ReportAiDraftReadyEvent extends BaseDomainEvent<ReportAiDraftReadyEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ReportAiDraftReadyEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ReportAiDraftReadyEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ReportAiDraftReadyEvent {
  export class Payload {
    constructor(
      public readonly reportId: string,
      public readonly lessonId: string,
      public readonly teacherId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { ReportAiDraftReadyEvent };
