import { OrganizationMembershipId } from '../value-objects';
import { OrganizationMembership } from '../entities/org-membership.entity';

export abstract class IOrganizationMembershipRepository {
  abstract findByUserId( userId: string): Promise<OrganizationMembership | null>;
  abstract findAByOrgId(orgId: string): Promise<OrganizationMembershipId | null>;

}