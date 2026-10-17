export class GetStudentMasteryQuery {
  constructor(
    public readonly studentId: string,
    public readonly orgId?: string,
    public readonly curriculumNodeId?: string,
  ) {}
}
