export interface GetOrgReportsFilter {
  status?: string;
  classroomId?: string;
  subjectId?: string;
  teacherId?: string;
  studentId?: string;
  attendanceStatus?: string;
  search?: string;
  from?: string;
  to?: string;
}

export class GetOrgReportsQuery {
  constructor(
    public readonly orgId: string,
    public readonly filters?: GetOrgReportsFilter,
  ) {}
}
