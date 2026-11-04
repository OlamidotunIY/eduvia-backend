export interface OrganizationAuthorizationDTO {
  membershipId: string;
  roleId: string | null;
  roleName: string;
  permissions: string[];
  isActive: boolean;
}

export abstract class IOrganizationAuthorizationQueryPort {
  abstract getEffectiveAuthorization(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationAuthorizationDTO | null>;
}
