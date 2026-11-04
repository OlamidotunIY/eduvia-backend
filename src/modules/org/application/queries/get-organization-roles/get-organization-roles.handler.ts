import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  IOrganizationRoleRepository,
  OrganizationInvariantError,
  OrganizationPermission,
} from '../../../domain';
import { OrganizationRoleDTO } from './get-organization-roles.dto';
import { GetOrganizationRolesQuery } from './get-organization-roles.query';

@QueryHandler(GetOrganizationRolesQuery)
export class GetOrganizationRolesHandler
  implements IQueryHandler<GetOrganizationRolesQuery, OrganizationRoleDTO[]>
{
  constructor(
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    private readonly roleRepository: IOrganizationRoleRepository,
  ) {}

  async execute(query: GetOrganizationRolesQuery): Promise<OrganizationRoleDTO[]> {
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      query.orgId,
      query.callerUserId,
    );
    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ROLES_READ)) {
      throw new OrganizationInvariantError('Caller cannot view organization roles');
    }

    const roles = await this.roleRepository.findByOrgId(query.orgId);
    return roles.map((role) => ({
      id: role.getId(),
      orgId: role.orgId.value,
      key: role.key,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }
}
