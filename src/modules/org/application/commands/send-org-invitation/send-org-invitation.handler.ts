import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { SendOrganizationInvitationCommand } from './send-org-invitation.command';
import { SendOrganizationInvitationResult } from './send-org-invitation.result';
import {
  IOrganizationInvitationRepository,
  IOrganizationMembershipRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationInvitation,
} from '../../../domain';

@CommandHandler(SendOrganizationInvitationCommand)
export class SendOrganizationInvitationHandler
  implements ICommandHandler<SendOrganizationInvitationCommand, SendOrganizationInvitationResult>
{
  constructor(
    private readonly invitationRepository: IOrganizationInvitationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: SendOrganizationInvitationCommand,
  ): Promise<SendOrganizationInvitationResult> {
    const { payload } = command;

    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.callerUserId,
    );

    if (!membership || !membership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const invitation = OrganizationInvitation.create({
      orgId: OrganizationId.from(payload.orgId),
      inviterUserId: payload.callerUserId,
      inviteeEmail: payload.inviteeEmail,
      role: payload.role,
      subjects: payload.subjects,
      tokenHash,
      rawToken,
      correlationId: payload.correlationId,
    });

    await this.invitationRepository.save(invitation);

    return {
      id: invitation.getId(),
      rawToken,
    };
  }
}
