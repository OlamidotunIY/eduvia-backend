import { Command } from '@nestjs/cqrs';
import { CreateOrganizationMembershipResult } from './create-organization-membership.result';
import { OrganizationId, OrganizationRole, OrganizationRoleId } from '../../../domain';

export class CreateOrganizationMembershipCommand extends Command<CreateOrganizationMembershipResult> {
  constructor(
    public readonly payload: {
      orgId: OrganizationId;
      userId: string;
      role: OrganizationRole;
      roleId?: OrganizationRoleId;
      subjects?: string[];
      activateForUserIfUnset?: boolean;
      correlationId?: string;
    },
  ) {
    super();
  }
}
