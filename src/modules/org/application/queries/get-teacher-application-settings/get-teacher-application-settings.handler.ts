import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  IOrganizationRepository,
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
  OrganizationPermission,
} from '../../../domain';
import {
  GetTeacherApplicationSettingsQuery,
  TeacherApplicationSettingsResult,
} from './get-teacher-application-settings.query';

@QueryHandler(GetTeacherApplicationSettingsQuery)
export class GetTeacherApplicationSettingsHandler
  implements
    IQueryHandler<GetTeacherApplicationSettingsQuery, TeacherApplicationSettingsResult>
{
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    query: GetTeacherApplicationSettingsQuery,
  ): Promise<TeacherApplicationSettingsResult> {
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      query.orgId,
      query.callerUserId,
    );

    if (
      !authorization?.isActive ||
      !authorization.permissions.includes(OrganizationPermission.APPLICATIONS_READ)
    ) {
      throw new OrganizationInvariantError(
        'Caller cannot view teacher application settings',
      );
    }

    const organization = await this.organizationRepository.findById(
      OrganizationId.from(query.orgId),
    );
    if (!organization) {
      throw new OrganizationNotFound('Organization not found');
    }

    return {
      organizationId: organization.getId(),
      acceptingTeachers: organization.acceptingTeachers,
      marketplaceListed: organization.marketplaceListed,
    };
  }
}
