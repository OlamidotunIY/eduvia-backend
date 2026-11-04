import { Command } from '@nestjs/cqrs';

export class AssignOrganizationRoleCommand extends Command<{ id: string; roleId: string }> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      targetUserId: string;
      roleId: string;
    },
  ) {
    super();
  }
}
