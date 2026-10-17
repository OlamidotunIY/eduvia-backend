import { BaseDomainEvent } from '@modules/shared/domain';

class AnnouncementArchivedEvent extends BaseDomainEvent<AnnouncementArchivedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AnnouncementArchivedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AnnouncementArchivedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AnnouncementArchivedEvent {
  export class Payload {
    constructor(
      public readonly announcementId: string,
      public readonly archivedAt: Date,
    ) {}
  }
}

export { AnnouncementArchivedEvent };
