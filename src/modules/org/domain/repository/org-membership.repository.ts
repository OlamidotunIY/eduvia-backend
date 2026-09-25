import { BaseRepository } from '@modules/shared';
import { OrganizationMembershipId } from '../value-objects';
import { OrganizationMembership } from '../entities/org-membership.entity';

export abstract class IOrganizationMembershipRepository extends BaseRepository<OrganizationMembership, OrganizationMembershipId> {
  abstract findByUserId( userId: string): Promise<OrganizationMembershipId | null>;
  abstract findAByOrgId(orgId: string): Promise<OrganizationMembership | null>;

}