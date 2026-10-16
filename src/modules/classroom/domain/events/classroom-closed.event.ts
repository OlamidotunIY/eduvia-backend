import { BaseDomainEvent } from '@modules/shared';

class ClassroomClosedEvent extends BaseDomainEvent<ClassroomClosedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ClassroomClosedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ClassroomClosedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ClassroomClosedEvent {
  export class Payload {
    constructor(
      public readonly classroomId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { ClassroomClosedEvent };
