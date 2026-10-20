import { Command } from '@nestjs/cqrs';
import { SuspendMemberResult } from './suspend-member.result';

export class SuspendMemberCommand extends Command<SuspendMemberResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      targetUserId: string;
    },
  ) {
    super();
  }
}
