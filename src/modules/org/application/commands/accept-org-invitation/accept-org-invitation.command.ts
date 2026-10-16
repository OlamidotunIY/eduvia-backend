import { Command } from '@nestjs/cqrs';
import { AcceptOrganizationInvitationResult } from './accept-org-invitation.result';

export class AcceptOrganizationInvitationByTokenCommand extends Command<AcceptOrganizationInvitationResult> {
  constructor(
    public readonly payload: {
      rawToken: string;
      acceptedByUserId: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
