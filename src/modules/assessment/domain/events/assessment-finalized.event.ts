import { BaseDomainEvent } from '@modules/shared';

class AssessmentFinalizedEvent extends BaseDomainEvent<AssessmentFinalizedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AssessmentFinalizedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AssessmentFinalizedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AssessmentFinalizedEvent {
  export class Payload {
    constructor(
      public readonly assessmentId: string,
      public readonly studentId: string,
      public readonly scorePercent: number,
      public readonly curriculumNodeId: string | null = null,
    ) {}
  }
}

export { AssessmentFinalizedEvent };
