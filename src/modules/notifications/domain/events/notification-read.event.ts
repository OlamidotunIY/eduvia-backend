import { BaseDomainEvent } from '@modules/shared/domain';

class NotificationReadEvent extends BaseDomainEvent<NotificationReadEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: NotificationReadEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: NotificationReadEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace NotificationReadEvent {
  export class Payload {
    constructor(
      public readonly notificationId: string,
      public readonly recipientId: string,
      public readonly readAt: Date,
    ) {}
  }
}

export { NotificationReadEvent };
