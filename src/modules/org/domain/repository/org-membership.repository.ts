import { OrganizationMembership } from '../entities/org-membership.entity';
import { OrganizationId } from '../value-objects';

export abstract class IOrganizationMembershipRepository {

  public abstract findByOrganizationId(
    orgId: OrganizationId |string,
  ): Promise<OrganizationMembership[]>;


  public abstract findByUserId(
    userId: string,
  ): Promise<OrganizationMembership[]>;

  
}