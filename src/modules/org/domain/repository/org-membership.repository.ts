import { BaseRepository } from '@modules/shared';
import { OrganizationMembershipId } from '../value-objects';
import { OrganizationMembership } from '../entities/org-membership.entity';

export abstract class IOrganizationMembershipRepository extends BaseRepository<OrganizationMembership, OrganizationMembershipId> {
  abstract findByUserId( userId: string): Promise<OrganizationMembership | null>;
  abstract findAByOrgId(orgId: string): Promise<OrganizationMembershipId | null>;

}