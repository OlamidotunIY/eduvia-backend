import { BaseDomainEvent } from '@modules/shared';

class ClassroomPausedEvent extends BaseDomainEvent<ClassroomPausedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ClassroomPausedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ClassroomPausedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ClassroomPausedEvent {
  export class Payload {
    constructor(
      public readonly classroomId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { ClassroomPausedEvent };
