import { BaseDomainEvent } from '@modules/shared';

class CoverTeacherAssignedEvent extends BaseDomainEvent<CoverTeacherAssignedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: CoverTeacherAssignedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: CoverTeacherAssignedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace CoverTeacherAssignedEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly coverTeacherId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { CoverTeacherAssignedEvent };
