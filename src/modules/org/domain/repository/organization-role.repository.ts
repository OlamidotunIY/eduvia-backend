import { BaseRepository } from '@modules/shared';
import { OrganizationRole } from '../model/OrganizationRole';
import {
  OrganizationId,
  OrganizationRoleId,
  OrganizationRoleKey,
} from '../value-objects';

export abstract class IOrganizationRoleRepository extends BaseRepository<OrganizationRole, OrganizationRoleId> {
  abstract findByOrgId(orgId: OrganizationId | string): Promise<OrganizationRole[]>;
  abstract findByOrgIdAndKey(orgId: OrganizationId | string, key: OrganizationRoleKey): Promise<OrganizationRole | null>;
  abstract findByOrgIdAndName(orgId: OrganizationId | string, name: string): Promise<OrganizationRole | null>;
}
