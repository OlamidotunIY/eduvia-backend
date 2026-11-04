import { OrganizationPermission } from '../../domain';

export class CreateOrganizationRoleDTO {
  name!: string;
  description?: string;
  permissions!: OrganizationPermission[];
}
