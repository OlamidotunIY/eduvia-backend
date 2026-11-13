export interface GetMissingReportLessonsFilter {
  classroomId?: string;
  teacherId?: string;
  search?: string;
}

export class GetMissingReportLessonsQuery {
  constructor(
    public readonly orgId: string,
    public readonly filters?: GetMissingReportLessonsFilter,
  ) {}
}
