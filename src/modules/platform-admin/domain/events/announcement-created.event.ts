import { BaseDomainEvent } from '@modules/shared/domain';

class AnnouncementCreatedEvent extends BaseDomainEvent<AnnouncementCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AnnouncementCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AnnouncementCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AnnouncementCreatedEvent {
  export class Payload {
    constructor(
      public readonly announcementId: string,
      public readonly title: string,
      public readonly createdBy: string,
    ) {}
  }
}

export { AnnouncementCreatedEvent };
