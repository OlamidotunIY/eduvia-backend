import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import * as crypto from 'crypto';
import { SendOrganizationInvitationCommand } from './send-org-invitation.command';
import { SendOrganizationInvitationResult } from './send-org-invitation.result';
import {
  IOrganizationInvitationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationInvitation,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(SendOrganizationInvitationCommand)
export class SendOrganizationInvitationHandler
  implements ICommandHandler<SendOrganizationInvitationCommand, SendOrganizationInvitationResult>
{
  constructor(
    private readonly invitationRepository: IOrganizationInvitationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: SendOrganizationInvitationCommand,
  ): Promise<SendOrganizationInvitationResult> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.MEMBERS_INVITE)) {
      throw new OrganizationInvariantError('Caller cannot invite organization members');
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
