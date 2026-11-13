import { Query } from '@nestjs/cqrs';

export interface TeacherApplicationSettingsResult {
  organizationId: string;
  acceptingTeachers: boolean;
  marketplaceListed: boolean;
}

export class GetTeacherApplicationSettingsQuery extends Query<TeacherApplicationSettingsResult> {
  constructor(
    public readonly orgId: string,
    public readonly callerUserId: string,
  ) {
    super();
  }
}
