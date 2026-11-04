import { OrganizationPermission, OrganizationRoleKey } from '../../../domain';

export interface OrganizationRoleDTO {
  id: string;
  orgId: string;
  key: OrganizationRoleKey | null;
  name: string;
  description: string | null;
  permissions: OrganizationPermission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}
