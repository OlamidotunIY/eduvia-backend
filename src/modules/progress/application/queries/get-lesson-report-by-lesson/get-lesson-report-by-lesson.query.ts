export class GetLessonReportByLessonQuery {
  constructor(
    public readonly lessonId: string,
    public readonly requesterRole?: 'teacher' | 'parent' | 'admin',
  ) {}
}
