export class ListClassroomsQuery {
  constructor(
    public readonly orgId: string,
    public readonly teacherId?: string,
  ) {}
}
