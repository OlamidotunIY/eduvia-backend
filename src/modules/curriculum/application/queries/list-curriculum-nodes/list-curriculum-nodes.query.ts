export class ListCurriculumNodesQuery {
  constructor(
    public readonly curriculumId: string,
    public readonly depth?: number,
  ) {}
}
