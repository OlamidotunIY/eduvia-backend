import { BaseDomainEvent } from '@modules/shared';

class AssessmentCreatedEvent extends BaseDomainEvent<AssessmentCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AssessmentCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AssessmentCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AssessmentCreatedEvent {
  export class Payload {
    constructor(
      public readonly assessmentId: string,
      public readonly lessonId: string,
      public readonly studentId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { AssessmentCreatedEvent };
