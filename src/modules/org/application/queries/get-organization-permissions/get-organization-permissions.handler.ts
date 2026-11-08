import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  OrganizationInvariantError,
  OrganizationPermission,
  ORGANIZATION_PERMISSION_CATALOG,
} from '../../../domain';
import { OrganizationPermissionDefinitionDTO } from './get-organization-permissions.dto';
import { GetOrganizationPermissionsQuery } from './get-organization-permissions.query';

@QueryHandler(GetOrganizationPermissionsQuery)
export class GetOrganizationPermissionsHandler
  implements IQueryHandler<GetOrganizationPermissionsQuery, OrganizationPermissionDefinitionDTO[]>
{
  constructor(
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    query: GetOrganizationPermissionsQuery,
  ): Promise<OrganizationPermissionDefinitionDTO[]> {
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      query.orgId,
      query.callerUserId,
    );
    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ROLES_READ)) {
      throw new OrganizationInvariantError('Caller cannot view organization permissions');
    }

    return ORGANIZATION_PERMISSION_CATALOG.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
    }));
  }
}
