import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { GetOrganizationMembersQuery } from './get-org-members.query';
import { OrganizationMemberDTO } from './get-org-members.dto';
import { IOrganizationMembershipRepository } from '../../../domain/repository';
import { OrganizationInvariantError, OrganizationPermission } from '../../../domain';

@QueryHandler(GetOrganizationMembersQuery)
export class GetOrganizationMembersHandler
  implements IQueryHandler<GetOrganizationMembersQuery, OrganizationMemberDTO[]>
{
  constructor(
    private readonly membershipRepository: IOrganizationMembershipRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    query: GetOrganizationMembersQuery,
  ): Promise<OrganizationMemberDTO[]> {
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      query.orgId,
      query.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.MEMBERS_READ)) {
      throw new OrganizationInvariantError('Caller cannot view organization members');
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
