import { OrganizationPermission } from '../../../domain';

export interface OrganizationPermissionDefinitionDTO {
  id: OrganizationPermission;
  name: string;
  category: string;
  description: string;
}
