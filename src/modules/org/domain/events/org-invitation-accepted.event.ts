import { BaseDomainEvent } from '@modules/shared';
import { InvitationRole } from '../value-objects/org-invitation.role.v0';
import { OrganizationId } from '../value-objects';

class OrganizationInvitationAcceptedEvent extends BaseDomainEvent<OrganizationInvitationAcceptedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrganizationInvitationAcceptedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrganizationInvitationAcceptedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrganizationInvitationAcceptedEvent {
  export class Payload {
    constructor(
      public readonly invitationId: string,
      public readonly orgId: OrganizationId,
      public readonly acceptedByUserId: string,
      public readonly role: InvitationRole,
      public readonly subjects: string[],
    ) {}
  }
}

export { OrganizationInvitationAcceptedEvent };