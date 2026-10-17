import { BaseDomainEvent } from '@modules/shared/domain';

class NotificationDeliveredEvent extends BaseDomainEvent<NotificationDeliveredEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: NotificationDeliveredEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: NotificationDeliveredEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace NotificationDeliveredEvent {
  export class Payload {
    constructor(
      public readonly notificationId: string,
      public readonly recipientId: string,
      public readonly deliveredAt: Date,
    ) {}
  }
}

export { NotificationDeliveredEvent };
