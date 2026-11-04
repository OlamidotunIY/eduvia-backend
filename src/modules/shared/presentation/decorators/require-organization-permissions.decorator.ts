import { SetMetadata } from '@nestjs/common';

export const ORGANIZATION_PERMISSIONS_KEY = 'organizationPermissions';

export const RequireOrganizationPermissions = (...permissions: string[]) =>
  SetMetadata(ORGANIZATION_PERMISSIONS_KEY, permissions);
