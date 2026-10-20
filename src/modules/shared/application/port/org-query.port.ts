export interface OrganizationSummaryDTO {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  status: string;
  marketplaceListed: boolean;
}

export interface OrganizationMembershipDTO {
  id: string;
  orgId: string;
  userId: string;
  role: string;
  status: string;
  subjects: string[];
}

export abstract class IOrganizationQueryPort {
  abstract getOrganizationById(id: string): Promise<OrganizationSummaryDTO | null>;
  abstract getOrganizationBySlug(slug: string): Promise<OrganizationSummaryDTO | null>;
  abstract getMembership(orgId: string, userId: string): Promise<OrganizationMembershipDTO | null>;
  abstract isMember(orgId: string, userId: string): Promise<boolean>;
  abstract isOrgActive(id: string): Promise<boolean>;
}
