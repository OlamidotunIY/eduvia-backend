import { BaseRepository } from '@modules/shared';
import { OrganizationAccessRole } from '../model/OrganizationAccessRole';
import {
  OrganizationId,
  OrganizationRoleId,
  OrganizationRoleKey,
} from '../value-objects';

export abstract class IOrganizationRoleRepository extends BaseRepository<OrganizationAccessRole, OrganizationRoleId> {
  abstract findByOrgId(orgId: OrganizationId | string): Promise<OrganizationAccessRole[]>;
  abstract findByOrgIdAndKey(orgId: OrganizationId | string, key: OrganizationRoleKey): Promise<OrganizationAccessRole | null>;
  abstract findByOrgIdAndName(orgId: OrganizationId | string, name: string): Promise<OrganizationAccessRole | null>;
}
