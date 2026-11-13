import { OrganizationRole } from './org-role.v0';
import { OrganizationRoleKey } from './organization-role-key.vo';

const ROLE_KEY_TO_LEGACY_ROLE: Record<OrganizationRoleKey, OrganizationRole> = {
  [OrganizationRoleKey.ORG_OWNER]: OrganizationRole.OWNER,
  [OrganizationRoleKey.ORG_ADMIN]: OrganizationRole.ADMIN,
  [OrganizationRoleKey.LEAD_TEACHER]: OrganizationRole.LEAD_TEACHER,
  [OrganizationRoleKey.TEACHER]: OrganizationRole.TEACHER,
  [OrganizationRoleKey.TEACHING_ASSISTANT]: OrganizationRole.TEACHING_ASSISTANT,
  [OrganizationRoleKey.ACADEMIC_COORDINATOR]: OrganizationRole.TEACHER,
};

const LEGACY_ROLE_TO_ROLE_KEY: Record<OrganizationRole, OrganizationRoleKey> = {
  [OrganizationRole.OWNER]: OrganizationRoleKey.ORG_OWNER,
  [OrganizationRole.ADMIN]: OrganizationRoleKey.ORG_ADMIN,
  [OrganizationRole.LEAD_TEACHER]: OrganizationRoleKey.LEAD_TEACHER,
  [OrganizationRole.TEACHER]: OrganizationRoleKey.TEACHER,
  [OrganizationRole.TEACHING_ASSISTANT]: OrganizationRoleKey.TEACHING_ASSISTANT,
};

/**
 * Converts a default organization role key into its legacy membership role enum.
 */
export function roleKeyToLegacyRole(
  key: OrganizationRoleKey | null | undefined,
): OrganizationRole {
  if (!key) {
    return OrganizationRole.TEACHER;
  }
  return ROLE_KEY_TO_LEGACY_ROLE[key] ?? OrganizationRole.TEACHER;
}

/**
 * Converts a legacy organization membership role into its default role key.
 */
export function legacyRoleToRoleKey(role: OrganizationRole): OrganizationRoleKey {
  return LEGACY_ROLE_TO_ROLE_KEY[role] ?? OrganizationRoleKey.TEACHER;
}
