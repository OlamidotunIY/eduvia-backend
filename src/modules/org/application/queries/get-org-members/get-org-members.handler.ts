import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IOrganizationAuthorizationQueryPort,
  IUserQueryPort,
} from '@modules/shared';
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
    private readonly userQuery: IUserQueryPort,
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

    const userIds = Array.from(new Set(members.map((m) => m.userId)));
    const users = await Promise.all(
      userIds.map((id) => this.userQuery.getUserById(id).catch(() => null)),
    );
    const userMap = new Map<string, NonNullable<(typeof users)[number]>>();
    for (const u of users) {
      if (u) userMap.set(u.id, u);
    }

    return members.map((m) => {
      const u = userMap.get(m.userId);
      return {
        id: m.id.value,
        orgId: m.orgId.value,
        userId: m.userId,
        role: m.role,
        roleId: m.roleId?.value ?? null,
        subjects: m.subjects,
        status: m.status,
        joinedAt: m.joinedAt,
        updatedAt: m.updatedAt,
        user: u
          ? {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              image: u.image,
              status: u.status,
            }
          : null,
      };
    });
  }
}
