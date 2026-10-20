import { OrganizationMembership } from '../model/OrganizationMembership';
import { OrganizationId } from '../value-objects';

export abstract class IOrganizationMembershipRepository {
  public abstract findByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationMembership[]>;

  public abstract findByUserId(
    userId: string,
  ): Promise<OrganizationMembership[]>;

  public abstract findByOrgIdAndUserId(
    orgId: OrganizationId | string,
    userId: string,
  ): Promise<OrganizationMembership | null>;

  public abstract save(membership: OrganizationMembership): Promise<void>;
}