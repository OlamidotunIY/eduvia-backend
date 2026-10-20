import { BaseDomainEvent } from '@modules/shared';

class AssessmentMarkAppliedEvent extends BaseDomainEvent<AssessmentMarkAppliedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AssessmentMarkAppliedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AssessmentMarkAppliedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AssessmentMarkAppliedEvent {
  export class Payload {
    constructor(
      public readonly assessmentId: string,
      public readonly markingItemId: string,
      public readonly marksAwarded: number,
    ) {}
  }
}

export { AssessmentMarkAppliedEvent };
