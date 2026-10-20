import { BaseDomainEvent } from '@modules/shared';

class CurriculumNodeCreatedEvent extends BaseDomainEvent<CurriculumNodeCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: CurriculumNodeCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: CurriculumNodeCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace CurriculumNodeCreatedEvent {
  export class Payload {
    constructor(
      public readonly nodeId: string,
      public readonly curriculumId: string,
      public readonly parentNodeId: string | null,
      public readonly nodeType: string,
    ) {}
  }
}

export { CurriculumNodeCreatedEvent };
