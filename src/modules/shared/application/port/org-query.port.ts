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

export interface UserOrganizationDTO {
  organization: OrganizationSummaryDTO;
  membership: OrganizationMembershipDTO;
  memberCount: number;
}

export abstract class IOrganizationQueryPort {
  abstract getOrganizationById(id: string): Promise<OrganizationSummaryDTO | null>;
  abstract getOrganizationBySlug(slug: string): Promise<OrganizationSummaryDTO | null>;
  abstract getMembership(orgId: string, userId: string): Promise<OrganizationMembershipDTO | null>;
  abstract getOrganizationsForUser(userId: string): Promise<UserOrganizationDTO[]>;
  abstract getActiveAdminUserIds(orgId: string): Promise<string[]>;
  abstract isMember(orgId: string, userId: string): Promise<boolean>;
  abstract isOrgActive(id: string): Promise<boolean>;
}
