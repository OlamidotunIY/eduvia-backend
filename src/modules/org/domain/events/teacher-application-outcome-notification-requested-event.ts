import { BaseDomainEvent } from '@modules/shared';

class TeacherApplicationOutcomeNotificationRequestedEvent extends BaseDomainEvent<TeacherApplicationOutcomeNotificationRequestedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: TeacherApplicationOutcomeNotificationRequestedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId: String(aggregateId),
      eventName: TeacherApplicationOutcomeNotificationRequestedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TeacherApplicationOutcomeNotificationRequestedEvent {
  export class Payload {
    constructor(
      public readonly applicationId: string,
      public readonly organizationId: string,
      public readonly applicantUserId: string,
      public readonly outcome: string,
      public readonly rejectionReason: string | null,
    ) {}
  }
}

export { TeacherApplicationOutcomeNotificationRequestedEvent };
