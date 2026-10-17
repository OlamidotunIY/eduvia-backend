import { BaseDomainEvent } from '@modules/shared/domain';

class ProgressSummaryUpdatedEvent extends BaseDomainEvent<ProgressSummaryUpdatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ProgressSummaryUpdatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ProgressSummaryUpdatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ProgressSummaryUpdatedEvent {
  export class Payload {
    constructor(
      public readonly studentId: string,
      public readonly orgId: string,
      public readonly subjectId: string,
      public readonly overallMasteryLevel: number | null,
      public readonly lastUpdatedAt: Date,
    ) {}
  }
}

export { ProgressSummaryUpdatedEvent };
