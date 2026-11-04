import { Command } from '@nestjs/cqrs';
import { OrganizationPermission } from '../../../domain';

export class CreateOrganizationRoleCommand extends Command<{ id: string }> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      name: string;
      description: string | null;
      permissions: OrganizationPermission[];
    },
  ) {
    super();
  }
}
