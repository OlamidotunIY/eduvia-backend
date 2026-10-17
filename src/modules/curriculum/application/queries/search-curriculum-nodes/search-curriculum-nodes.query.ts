export class SearchCurriculumNodesQuery {
  constructor(
    public readonly query: string,
    public readonly curriculumId?: string,
  ) {}
}
