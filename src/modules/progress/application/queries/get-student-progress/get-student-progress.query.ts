export class GetStudentProgressQuery {
  constructor(
    public readonly studentId: string,
    public readonly orgId?: string,
    public readonly subjectId?: string,
  ) {}
}
