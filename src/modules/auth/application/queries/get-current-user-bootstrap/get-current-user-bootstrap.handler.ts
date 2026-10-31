import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCurrentUserBootstrapQuery } from './get-current-user-bootstrap.query';
import { CurrentUserBootstrapDTO } from './get-current-user-bootstrap.payload';
import { IOrganizationQueryPort, IUserQueryPort } from '@modules/shared';

@QueryHandler(GetCurrentUserBootstrapQuery)
export class GetCurrentUserBootstrapHandler implements IQueryHandler<GetCurrentUserBootstrapQuery, CurrentUserBootstrapDTO> {
  constructor(
    private readonly userQueryPort: IUserQueryPort,
    private readonly organizationQueryPort: IOrganizationQueryPort,
  ) {}

  async execute(query: GetCurrentUserBootstrapQuery): Promise<CurrentUserBootstrapDTO> {
    const { payload } = query;

    const user = await this.userQueryPort.getUserById(payload.userId);
    if (!user) throw new Error('User not found');
    const organizations = await this.organizationQueryPort.getOrganizationsForUser(user.id);
    const organizationDtos = organizations.map((item) => ({
      id: item.organization.id, name: item.organization.name, slug: item.organization.slug,
      role: item.membership.role, status: item.organization.status, memberCount: item.memberCount,
    }));
    const active = organizationDtos[0] ?? null;
    return {
      user: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        image: user.image, userType: user.userType, onboardingStatus: user.onboardingStatus,
        emailVerified: user.emailVerified, timezone: user.timezone,
      },
      activeOrganization: active && { id: active.id, name: active.name, slug: active.slug, role: active.role, memberCount: active.memberCount },
      organizations: organizationDtos,
    };
  }
}
