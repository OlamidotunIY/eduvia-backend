export class GetTeacherAvailabilityQuery {
  constructor(
    public readonly orgId: string,
    public readonly teacherId: string,
  ) {}
}
