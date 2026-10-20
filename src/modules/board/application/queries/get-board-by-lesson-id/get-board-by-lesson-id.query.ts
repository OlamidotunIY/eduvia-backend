export class GetBoardByLessonIdQuery {
  constructor(
    public readonly lessonId: string,
    public readonly orgId?: string,
  ) {}
}
