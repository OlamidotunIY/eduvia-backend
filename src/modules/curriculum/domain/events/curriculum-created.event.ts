import { BaseDomainEvent } from '@modules/shared';

class CurriculumCreatedEvent extends BaseDomainEvent<CurriculumCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: CurriculumCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: CurriculumCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace CurriculumCreatedEvent {
  export class Payload {
    constructor(
      public readonly curriculumId: string,
      public readonly name: string,
      public readonly countryCode: string,
    ) {}
  }
}

export { CurriculumCreatedEvent };
