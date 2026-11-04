import { OrganizationPermission } from '../../domain';

export class UpdateOrganizationRoleDTO {
  name!: string;
  description?: string;
  permissions!: OrganizationPermission[];
}
