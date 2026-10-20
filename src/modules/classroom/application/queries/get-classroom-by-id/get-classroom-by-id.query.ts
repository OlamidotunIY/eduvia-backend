export class GetClassroomByIdQuery {
  constructor(
    public readonly classroomId: string,
    public readonly orgId: string,
  ) {}
}
