export class GetQuestionSummaryQuery {
  constructor(
    public readonly orgId: string,
    public readonly teacherId?: string,
  ) {}
}
