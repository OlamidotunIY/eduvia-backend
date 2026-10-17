export class GetAssessmentByIdQuery {
  constructor(
    public readonly assessmentId: string,
    public readonly orgId?: string,
  ) {}
}
