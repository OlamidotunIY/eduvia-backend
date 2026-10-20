import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeMemberRoleCommand } from './change-member-role.command';
import { ChangeMemberRoleResult } from './change-member-role.result';
import { IOrganizationMembershipRepository } from '../../../domain/repository';
import {
  OrganizationInvariantError,
  OrganizationRole,
} from '../../../domain';

@CommandHandler(ChangeMemberRoleCommand)
export class ChangeMemberRoleHandler
  implements ICommandHandler<ChangeMemberRoleCommand, ChangeMemberRoleResult>
{
  constructor(
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: ChangeMemberRoleCommand,
  ): Promise<ChangeMemberRoleResult> {
    const { payload } = command;

    const callerMembership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.callerUserId,
    );

    if (!callerMembership || !callerMembership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
    }

    if (
      payload.newRole === OrganizationRole.ADMIN ||
      payload.newRole === OrganizationRole.OWNER
    ) {
      if (callerMembership.role !== OrganizationRole.OWNER) {
        throw new OrganizationInvariantError(
          'Only the OrgOwner can promote members to OrgAdmin or transfer ownership',
        );
      }
    }

    const targetMembership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.targetUserId,
    );

    if (!targetMembership) {
      throw new OrganizationInvariantError('Target user is not a member of this organization');
    }

    targetMembership.changeRole(payload.newRole);

    await this.membershipRepository.save(targetMembership);

    return {
      id: targetMembership.id.value,
      role: targetMembership.role,
    };
  }
}
