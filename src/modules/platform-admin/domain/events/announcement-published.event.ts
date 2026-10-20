import { BaseDomainEvent } from '@modules/shared/domain';

class AnnouncementPublishedEvent extends BaseDomainEvent<AnnouncementPublishedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: AnnouncementPublishedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: AnnouncementPublishedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace AnnouncementPublishedEvent {
  export class Payload {
    constructor(
      public readonly announcementId: string,
      public readonly title: string,
      public readonly body: string,
      public readonly targetRoles: string[],
      public readonly publishedAt: Date,
    ) {}
  }
}

export { AnnouncementPublishedEvent };
