import { Command } from '@nestjs/cqrs';
import { ChangeMemberRoleResult } from './change-member-role.result';
import { OrganizationRole } from '../../../domain';

export class ChangeMemberRoleCommand extends Command<ChangeMemberRoleResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      targetUserId: string;
      newRole: OrganizationRole;
    },
  ) {
    super();
  }
}
