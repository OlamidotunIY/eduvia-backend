import { Command } from '@nestjs/cqrs';
import { SendOrganizationInvitationResult } from './send-org-invitation.result';
import { InvitationRole } from '../../../domain';

export class SendOrganizationInvitationCommand extends Command<SendOrganizationInvitationResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      inviteeEmail: string;
      role: InvitationRole;
      subjects?: string[];
      correlationId: string;
    },
  ) {
    super();
  }
}
