import { Query } from '@nestjs/cqrs';
import { ApplicationStatus } from '../../../domain';
import { TeacherApplicationDTO } from './get-teacher-applications.dto';

export class GetTeacherApplicationsQuery extends Query<TeacherApplicationDTO[]> {
  constructor(
    public readonly orgId: string,
    public readonly callerUserId: string,
    public readonly status?: ApplicationStatus,
  ) {
    super();
  }
}
