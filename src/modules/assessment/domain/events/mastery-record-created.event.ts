import { BaseDomainEvent } from '@modules/shared';

class MasteryRecordCreatedEvent extends BaseDomainEvent<MasteryRecordCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: MasteryRecordCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: MasteryRecordCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace MasteryRecordCreatedEvent {
  export class Payload {
    constructor(
      public readonly masteryRecordId: string,
      public readonly studentId: string,
      public readonly curriculumNodeId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { MasteryRecordCreatedEvent };
