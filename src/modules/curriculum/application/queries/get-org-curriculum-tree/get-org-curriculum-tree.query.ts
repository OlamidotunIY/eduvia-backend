export class GetOrganizationCurriculumTreeQuery {
  constructor(
    public readonly organizationId: string,
    public readonly curriculumId: string,
    public readonly preview?: boolean,
  ) {}
}
