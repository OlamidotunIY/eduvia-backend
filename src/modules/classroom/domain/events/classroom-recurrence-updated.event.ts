import { BaseDomainEvent } from '@modules/shared';

class ClassroomRecurrenceUpdatedEvent extends BaseDomainEvent<ClassroomRecurrenceUpdatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ClassroomRecurrenceUpdatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ClassroomRecurrenceUpdatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ClassroomRecurrenceUpdatedEvent {
  export class Payload {
    constructor(
      public readonly classroomId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { ClassroomRecurrenceUpdatedEvent };
