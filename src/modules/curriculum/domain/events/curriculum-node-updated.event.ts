import { BaseDomainEvent } from '@modules/shared';

class CurriculumNodeUpdatedEvent extends BaseDomainEvent<CurriculumNodeUpdatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: CurriculumNodeUpdatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: CurriculumNodeUpdatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace CurriculumNodeUpdatedEvent {
  export class Payload {
    constructor(public readonly nodeId: string) {}
  }
}

export { CurriculumNodeUpdatedEvent };
