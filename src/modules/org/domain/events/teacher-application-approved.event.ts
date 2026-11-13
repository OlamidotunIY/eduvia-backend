import { BaseDomainEvent } from '@modules/shared';
import { OrganizationId, OrganizationRole } from '../value-objects';

class TeacherApplicationApprovedEvent extends BaseDomainEvent<TeacherApplicationApprovedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: TeacherApplicationApprovedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: TeacherApplicationApprovedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TeacherApplicationApprovedEvent {
  export class Payload {
    constructor(
      public readonly applicationId: string,
      public readonly orgId: OrganizationId,
      public readonly applicantUserId: string,
      public readonly approvedSubjects: string[],
      public readonly role: OrganizationRole = OrganizationRole.TEACHER,
      public readonly roleId: string | null = null,
    ) {}
  }
}

export { TeacherApplicationApprovedEvent };