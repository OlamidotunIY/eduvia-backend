import { Query } from '@nestjs/cqrs';
import { OrganizationMemberDTO } from './get-org-members.dto';

export class GetOrganizationMembersQuery extends Query<OrganizationMemberDTO[]> {
  constructor(
    public readonly orgId: string,
    public readonly callerUserId: string,
  ) {
    super();
  }
}
