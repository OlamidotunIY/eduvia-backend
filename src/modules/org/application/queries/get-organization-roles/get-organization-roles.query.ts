import { Query } from '@nestjs/cqrs';
import { OrganizationRoleDTO } from './get-organization-roles.dto';

export class GetOrganizationRolesQuery extends Query<OrganizationRoleDTO[]> {
  constructor(
    public readonly orgId: string,
    public readonly callerUserId: string,
  ) {
    super();
  }
}
