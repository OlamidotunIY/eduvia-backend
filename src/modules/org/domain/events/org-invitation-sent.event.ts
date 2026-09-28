import { BaseDomainEvent } from '@modules/shared';
import { InvitationRole } from '../value-objects/org-invitation.role.v0';
import { OrganizationId } from '../value-objects';

class OrganizationInvitationSentEvent extends BaseDomainEvent<OrganizationInvitationSentEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: OrganizationInvitationSentEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: OrganizationInvitationSentEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace OrganizationInvitationSentEvent {
  export class Payload {
    constructor(
      public readonly invitationId: string,
      public readonly orgId: OrganizationId,
      public readonly inviteeEmail: string,
      public readonly role: InvitationRole
    ) {}
  }
}

export { OrganizationInvitationSentEvent };