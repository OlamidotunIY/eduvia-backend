import { BaseDomainEvent } from '@modules/shared';
import { InvitationRole } from '../value-objects/org-invitation.role.v0';

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
      public readonly orgId: string,
      public readonly inviteeEmail: string,
      public readonly role: InvitationRole,
      public readonly rawToken: string,
    ) {}
  }
}

export { OrganizationInvitationSentEvent };