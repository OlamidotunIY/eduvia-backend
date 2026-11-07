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
    const users = await this.userQuery.getUsersByIds(userIds);
    const userMap = new Map<string, (typeof users)[number]>();
    for (const u of users) {
      if (u) userMap.set(u.id, u);
    }

    return members.map((m) => {
      const u = userMap.get(m.userId);
      const fullName = u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
        : null;

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
        fullName: fullName ?? null,
        firstName: u?.firstName ?? null,
        lastName: u?.lastName ?? null,
        email: u?.email ?? null,
        image: u?.image ?? null,
        avatarUrl: u?.image ?? null,
        user: u
          ? {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              fullName: fullName || `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              image: u.image,
              avatarUrl: u.image ?? null,
              status: u.status,
            }
          : null,
      };
    });
  }
}
