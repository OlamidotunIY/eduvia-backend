export class GetQuestionByIdQuery {
  constructor(
    public readonly questionId: string,
    public readonly orgId?: string,
    public readonly userRole?: string,
  ) {}
}
