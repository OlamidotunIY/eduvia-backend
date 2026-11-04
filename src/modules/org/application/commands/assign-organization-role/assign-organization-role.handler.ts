import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  IOrganizationMembershipRepository,
  IOrganizationRoleRepository,
  OrganizationInvariantError,
  OrganizationPermission,
  OrganizationRole,
  OrganizationRoleId,
  OrganizationRoleKey,
} from '../../../domain';
import { AssignOrganizationRoleCommand } from './assign-organization-role.command';

@CommandHandler(AssignOrganizationRoleCommand)
export class AssignOrganizationRoleHandler
  implements ICommandHandler<AssignOrganizationRoleCommand, { id: string; roleId: string }>
{
  constructor(
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    private readonly membershipRepository: IOrganizationMembershipRepository,
    private readonly roleRepository: IOrganizationRoleRepository,
  ) {}

  async execute(
    command: AssignOrganizationRoleCommand,
  ): Promise<{ id: string; roleId: string }> {
    const { payload } = command;
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );
    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.MEMBERS_MANAGE)) {
      throw new OrganizationInvariantError('Caller cannot assign organization roles');
    }

    const [callerMembership, membership, role] = await Promise.all([
      this.membershipRepository.findByOrgIdAndUserId(payload.orgId, payload.callerUserId),
      this.membershipRepository.findByOrgIdAndUserId(payload.orgId, payload.targetUserId),
      this.roleRepository.findById(OrganizationRoleId.from(payload.roleId)),
    ]);
    if (!membership?.isActive()) {
      throw new OrganizationInvariantError('Target user is not an active organization member');
    }
    if (!role || role.orgId.value !== payload.orgId) {
      throw new OrganizationInvariantError('Organization role was not found');
    }
    if (
      (role.key === OrganizationRoleKey.ORG_OWNER || role.key === OrganizationRoleKey.ORG_ADMIN) &&
      callerMembership?.role !== OrganizationRole.OWNER
    ) {
      throw new OrganizationInvariantError(
        'Only the organization owner can assign owner or admin roles',
      );
    }
    if (
      membership.role === OrganizationRole.OWNER &&
      callerMembership?.role !== OrganizationRole.OWNER
    ) {
      throw new OrganizationInvariantError('Only the organization owner can change the owner role');
    }

    membership.assignOrganizationRole(
      role.id,
      legacyRoleFor(role.key),
    );
    await this.membershipRepository.save(membership);
    return { id: membership.getId(), roleId: role.getId() };
  }
}

function legacyRoleFor(key: OrganizationRoleKey | null): OrganizationRole {
  switch (key) {
    case OrganizationRoleKey.ORG_OWNER:
      return OrganizationRole.OWNER;
    case OrganizationRoleKey.ORG_ADMIN:
      return OrganizationRole.ADMIN;
    case OrganizationRoleKey.LEAD_TEACHER:
      return OrganizationRole.LEAD_TEACHER;
    case OrganizationRoleKey.TEACHING_ASSISTANT:
      return OrganizationRole.TEACHING_ASSISTANT;
    default:
      return OrganizationRole.TEACHER;
  }
}
