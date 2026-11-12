import { IQuery } from '@nestjs/cqrs';

export interface GetOrgStudentsProgressFilter {
  classroomId?: string;
  subjectId?: string;
  search?: string;
  masteryTier?: string;
}

export class GetOrgStudentsProgressQuery implements IQuery {
  constructor(
    public readonly orgId: string,
    public readonly filters?: GetOrgStudentsProgressFilter,
  ) {}
}
