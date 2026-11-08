import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  IOrganizationMembershipRepository,
  IOrganizationRoleRepository,
  OrganizationInvariantError,
  OrganizationPermission,
  OrganizationRole,
  OrganizationRoleKey,
} from '../../../domain';
import { OrganizationRoleDTO } from './get-organization-roles.dto';
import { GetOrganizationRolesQuery } from './get-organization-roles.query';
import { ProvisionDefaultOrganizationRolesCommand } from '../../commands/provision-default-organization-roles';

@QueryHandler(GetOrganizationRolesQuery)
export class GetOrganizationRolesHandler
  implements IQueryHandler<GetOrganizationRolesQuery, OrganizationRoleDTO[]>
{
  constructor(
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    private readonly roleRepository: IOrganizationRoleRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(query: GetOrganizationRolesQuery): Promise<OrganizationRoleDTO[]> {
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      query.orgId,
      query.callerUserId,
    );
    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ROLES_READ)) {
      throw new OrganizationInvariantError('Caller cannot view organization roles');
    }

    let roles = await this.roleRepository.findByOrgId(query.orgId);
    if (roles.length === 0) {
      await this.commandBus.execute(
        new ProvisionDefaultOrganizationRolesCommand({
          orgId: query.orgId,
          correlationId: 'auto-provision',
        }),
      );
      roles = await this.roleRepository.findByOrgId(query.orgId);
    }

    const memberships = await this.membershipRepository.findByOrganizationId(query.orgId);

    return roles.map((role) => {
      const roleId = role.getId();
      const membersCount = memberships.filter((m) => {
        if (!m.isActive()) return false;
        if (m.roleId?.value === roleId) return true;
        if (!m.roleId && role.key) {
          return legacyRoleMatches(role.key, m.role);
        }
        return false;
      }).length;

      return {
        id: role.getId(),
        orgId: role.orgId.value,
        key: role.key,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
        membersCount,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
  }
}

function legacyRoleMatches(key: OrganizationRoleKey, role: OrganizationRole): boolean {
  switch (key) {
    case OrganizationRoleKey.ORG_OWNER:
      return role === OrganizationRole.OWNER;
    case OrganizationRoleKey.ORG_ADMIN:
      return role === OrganizationRole.ADMIN;
    case OrganizationRoleKey.LEAD_TEACHER:
      return role === OrganizationRole.LEAD_TEACHER;
    case OrganizationRoleKey.TEACHER:
      return role === OrganizationRole.TEACHER;
    case OrganizationRoleKey.TEACHING_ASSISTANT:
      return role === OrganizationRole.TEACHING_ASSISTANT;
    default:
      return false;
  }
}
