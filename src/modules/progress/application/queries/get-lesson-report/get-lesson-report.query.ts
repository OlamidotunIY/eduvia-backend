export class GetLessonReportQuery {
  constructor(
    public readonly reportId: string,
    public readonly requesterRole?: 'teacher' | 'parent' | 'admin',
  ) {}
}
