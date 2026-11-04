import { Injectable } from '@nestjs/common';
import {
  IOrganizationAuthorizationQueryPort,
  type OrganizationAuthorizationDTO,
} from '@modules/shared';
import {
  IOrganizationMembershipRepository,
  IOrganizationRoleRepository,
  ORGANIZATION_ROLE_DEFAULTS,
  OrganizationRole,
  OrganizationRoleKey,
} from '../../domain';

@Injectable()
export class OrganizationAuthorizationQueryAdapter
  implements IOrganizationAuthorizationQueryPort
{
  constructor(
    private readonly membershipRepository: IOrganizationMembershipRepository,
    private readonly roleRepository: IOrganizationRoleRepository,
  ) {}

  async getEffectiveAuthorization(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationAuthorizationDTO | null> {
    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      organizationId,
      userId,
    );
    if (!membership) return null;

    const role = membership.roleId
      ? await this.roleRepository.findById(membership.roleId)
      : await this.roleRepository.findByOrgIdAndKey(
          organizationId,
          legacyRoleKey(membership.role),
        );
    const fallback = role ? null : defaultRole(membership.role);

    return {
      membershipId: membership.getId(),
      roleId: role?.getId() ?? membership.roleId?.value ?? null,
      roleName: role?.name ?? fallback?.name ?? membership.role,
      permissions: role?.permissions ?? fallback?.permissions ?? [],
      isActive: membership.isActive(),
    };
  }
}

function legacyRoleKey(role: OrganizationRole): OrganizationRoleKey {
  switch (role) {
    case OrganizationRole.OWNER:
      return OrganizationRoleKey.ORG_OWNER;
    case OrganizationRole.ADMIN:
      return OrganizationRoleKey.ORG_ADMIN;
    case OrganizationRole.LEAD_TEACHER:
      return OrganizationRoleKey.LEAD_TEACHER;
    case OrganizationRole.TEACHING_ASSISTANT:
      return OrganizationRoleKey.TEACHING_ASSISTANT;
    default:
      return OrganizationRoleKey.TEACHER;
  }
}

function defaultRole(role: OrganizationRole) {
  return ORGANIZATION_ROLE_DEFAULTS.find(
    (definition) => definition.key === legacyRoleKey(role),
  );
}
