import { BaseDomainEvent } from '@modules/shared/domain';

class OrgAnalyticsSnapshotCreatedEvent extends BaseDomainEvent<OrgAnalyticsSnapshotCreatedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrgAnalyticsSnapshotCreatedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrgAnalyticsSnapshotCreatedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrgAnalyticsSnapshotCreatedEvent {
  export class Payload {
    constructor(
      public readonly snapshotId: string,
      public readonly orgId: string,
      public readonly snapshotDate: Date,
    ) {}
  }
}

export { OrgAnalyticsSnapshotCreatedEvent };
