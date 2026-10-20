import { BaseDomainEvent } from '@modules/shared';

class MasteryUpdatedEvent extends BaseDomainEvent<MasteryUpdatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: MasteryUpdatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: MasteryUpdatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace MasteryUpdatedEvent {
  export class Payload {
    constructor(
      public readonly masteryRecordId: string,
      public readonly studentId: string,
      public readonly curriculumNodeId: string,
      public readonly masteryLevel: number,
    ) {}
  }
}

export { MasteryUpdatedEvent };
