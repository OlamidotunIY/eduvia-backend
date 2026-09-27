import { Command } from '@nestjs/cqrs';
import { InvitationRole } from '../../../domain';
import { OrganizationInvitationAcceptedResult } from './org-invitation-accepted.result';

export class OrganizationInvitationAcceptedCommand extends Command<OrganizationInvitationAcceptedResult> {
  constructor(
    public readonly payload: {
      invitationId: string;
      acceptedByUserId: string;
      role: InvitationRole,
      subjects: string[],
      correlationId: string;
    
    },
  ) {
    super();
  }
}
