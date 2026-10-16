import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { AcceptOrganizationInvitationByTokenCommand } from './accept-org-invitation.command';
import { AcceptOrganizationInvitationResult } from './accept-org-invitation.result';
import { IOrganizationInvitationRepository } from '../../../domain/repository';
import { OrganizationInvariantError } from '../../../domain';

@CommandHandler(AcceptOrganizationInvitationByTokenCommand)
export class AcceptOrganizationInvitationByTokenHandler
  implements ICommandHandler<AcceptOrganizationInvitationByTokenCommand, AcceptOrganizationInvitationResult>
{
  constructor(
    private readonly invitationRepository: IOrganizationInvitationRepository,
  ) {}

  async execute(
    command: AcceptOrganizationInvitationByTokenCommand,
  ): Promise<AcceptOrganizationInvitationResult> {
    const { payload } = command;

    const tokenHash = crypto
      .createHash('sha256')
      .update(payload.rawToken)
      .digest('hex');

    const invitation = await this.invitationRepository.findByTokenHash(tokenHash);

    if (!invitation) {
      throw new OrganizationInvariantError('Invalid invitation token');
    }

    if (!invitation.isValid()) {
      throw new OrganizationInvariantError('Invitation is no longer valid');
    }

    invitation.accept(payload.acceptedByUserId, payload.correlationId);

    await this.invitationRepository.save(invitation);

    return {
      id: invitation.getId(),
      orgId: invitation.orgId.toString(),
    };
  }
}
