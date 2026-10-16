export class GetBoardByIdQuery {
  constructor(
    public readonly boardId: string,
    public readonly orgId?: string,
  ) {}
}
