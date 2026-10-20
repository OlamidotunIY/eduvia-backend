import { OrganizationRole } from '../../../domain';

export interface ChangeMemberRoleResult {
  id: string;
  role: OrganizationRole;
}
