export class GetStudentLessonHistoryQuery {
  constructor(
    public readonly studentId: string,
    public readonly orgId?: string,
    public readonly pagination?: { skip?: number; take?: number },
  ) {}
}
