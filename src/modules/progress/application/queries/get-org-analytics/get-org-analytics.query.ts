export class GetOrgAnalyticsQuery {
  constructor(
    public readonly orgId: string,
    public readonly date?: Date,
  ) {}
}
