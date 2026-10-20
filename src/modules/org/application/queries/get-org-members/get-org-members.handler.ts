import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationMembersQuery } from './get-org-members.query';
import { OrganizationMemberDTO } from './get-org-members.dto';
import { IOrganizationMembershipRepository } from '../../../domain/repository';
import { OrganizationInvariantError } from '../../../domain';

@QueryHandler(GetOrganizationMembersQuery)
export class GetOrganizationMembersHandler
  implements IQueryHandler<GetOrganizationMembersQuery, OrganizationMemberDTO[]>
{
  constructor(
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    query: GetOrganizationMembersQuery,
  ): Promise<OrganizationMemberDTO[]> {
    const callerMembership = await this.membershipRepository.findByOrgIdAndUserId(
      query.orgId,
      query.callerUserId,
    );

    if (!callerMembership || !callerMembership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
    }

    const members = await this.membershipRepository.findByOrganizationId(
      query.orgId,
    );

    return members.map((m) => ({
      id: m.id.value,
      orgId: m.orgId.value,
      userId: m.userId,
      role: m.role,
      subjects: m.subjects,
      status: m.status,
      joinedAt: m.joinedAt,
      updatedAt: m.updatedAt,
    }));
  }
}
