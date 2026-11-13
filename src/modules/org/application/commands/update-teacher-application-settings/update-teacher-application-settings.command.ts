import { Command } from '@nestjs/cqrs';

export interface UpdateTeacherApplicationSettingsResult {
  organizationId: string;
  acceptingTeachers: boolean;
  marketplaceListed: boolean;
}

export class UpdateTeacherApplicationSettingsCommand extends Command<UpdateTeacherApplicationSettingsResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      acceptingTeachers?: boolean;
      marketplaceListed?: boolean;
      correlationId: string;
    },
  ) {
    super();
  }
}
