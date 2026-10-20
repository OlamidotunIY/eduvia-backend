export class GetStudentResponseQuery {
  constructor(
    public readonly boardQuestionId: string,
    public readonly studentId: string,
  ) {}
}
