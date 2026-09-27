import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrganizationInvitationAcceptedCommand } from './org-invitation-accepted.command';
import { OrganizationInvitationAcceptedResult } from './org-invitation-accepted.result';
import { IOrganizationInvitationRepository } from '../../../domain/repository/org-invitation.repository';
import { IOrganizationRepository, OrganizationInvitationId } from '../../../domain';

@CommandHandler(OrganizationInvitationAcceptedCommand)
export class AcceptOrganizationInvitationHandler implements ICommandHandler<
  OrganizationInvitationAcceptedCommand,
  OrganizationInvitationAcceptedResult
> {
  constructor(
    private readonly organizationInvitationRepository: IOrganizationInvitationRepository,
  ) {}

  async execute(
    command: OrganizationInvitationAcceptedCommand,
  ): Promise<OrganizationInvitationAcceptedResult> {
    const { payload } = command;

    const invitation = await this.organizationInvitationRepository.findById(
      (payload.invitationId),
    );

    if (!invitation) {
      throw new Error('Organization invitation not found');
    }

    invitation.accept(payload.acceptedByUserId, payload.correlationId);

    await this.organizationInvitationRepository.save(invitation);

    return {
      id: invitation.getId(),
    };
  }
}
