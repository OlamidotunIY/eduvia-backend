export class ListClassroomLessonsQuery {
  constructor(
    public readonly classroomId: string,
    public readonly orgId: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
  ) {}
}
