import { BaseDomainEvent } from '@modules/shared';

class CurriculumNodeDeactivatedEvent extends BaseDomainEvent<CurriculumNodeDeactivatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: CurriculumNodeDeactivatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: CurriculumNodeDeactivatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace CurriculumNodeDeactivatedEvent {
  export class Payload {
    constructor(public readonly nodeId: string) {}
  }
}

export { CurriculumNodeDeactivatedEvent };
