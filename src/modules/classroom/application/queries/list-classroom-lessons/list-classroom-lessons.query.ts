export class ListClassroomLessonsQuery {
  constructor(
    public readonly classroomId: string,
    public readonly orgId: string,
  ) {}
}
