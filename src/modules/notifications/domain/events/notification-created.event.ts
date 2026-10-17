import { BaseDomainEvent } from '@modules/shared/domain';

class NotificationCreatedEvent extends BaseDomainEvent<NotificationCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: NotificationCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: NotificationCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace NotificationCreatedEvent {
  export class Payload {
    constructor(
      public readonly notificationId: string,
      public readonly recipientId: string,
      public readonly type: string,
      public readonly title: string,
      public readonly body: string,
      public readonly channel: string,
      public readonly data: Record<string, any>,
    ) {}
  }
}

export { NotificationCreatedEvent };
