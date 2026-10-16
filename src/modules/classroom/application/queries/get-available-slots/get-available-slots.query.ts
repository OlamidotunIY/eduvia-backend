export class GetAvailableSlotsQuery {
  constructor(
    public readonly orgId: string,
    public readonly teacherId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly durationMins: number,
  ) {}
}
