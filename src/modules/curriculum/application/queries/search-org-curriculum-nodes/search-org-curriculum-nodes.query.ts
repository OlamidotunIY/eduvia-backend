export class SearchOrganizationCurriculumNodesQuery {
  constructor(
    public readonly organizationId: string,
    public readonly query: string,
    public readonly curriculumId?: string,
  ) {}
}
