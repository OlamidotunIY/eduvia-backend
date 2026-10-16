import { Query } from '@nestjs/cqrs';
import { OrganizationSubjectDTO } from './get-org-subjects.dto';

export class GetOrganizationSubjectsQuery extends Query<OrganizationSubjectDTO[]> {
  constructor(
    public readonly orgId: string,
    public readonly activeOnly?: boolean,
  ) {
    super();
  }
}
