import { Command } from '@nestjs/cqrs';
import { OrganizationPermission } from '../../../domain';

export class UpdateOrganizationRoleCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orgId: string;
      roleId: string;
      callerUserId: string;
      name: string;
      description: string | null;
      permissions: OrganizationPermission[];
    },
  ) {
    super();
  }
}
