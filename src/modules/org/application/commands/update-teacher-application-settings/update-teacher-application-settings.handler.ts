import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  IOrganizationRepository,
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
  OrganizationPermission,
} from '../../../domain';
import {
  UpdateTeacherApplicationSettingsCommand,
  UpdateTeacherApplicationSettingsResult,
} from './update-teacher-application-settings.command';

@CommandHandler(UpdateTeacherApplicationSettingsCommand)
export class UpdateTeacherApplicationSettingsHandler
  implements
    ICommandHandler<
      UpdateTeacherApplicationSettingsCommand,
      UpdateTeacherApplicationSettingsResult
    >
{
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: UpdateTeacherApplicationSettingsCommand,
  ): Promise<UpdateTeacherApplicationSettingsResult> {
    const { payload } = command;
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );

    const canManage =
      authorization?.isActive &&
      (authorization.permissions.includes(OrganizationPermission.APPLICATIONS_REVIEW) ||
        authorization.permissions.includes(
          OrganizationPermission.ORGANIZATION_MARKETPLACE_MANAGE,
        ));
    if (!canManage) {
      throw new OrganizationInvariantError(
        'Caller cannot update teacher application settings',
      );
    }

    const organization = await this.organizationRepository.findById(
      OrganizationId.from(payload.orgId),
    );
    if (!organization) {
      throw new OrganizationNotFound('Organization not found');
    }

    if (payload.acceptingTeachers === true) {
      organization.openForTeacherApplication();
    } else if (payload.acceptingTeachers === false) {
      organization.closeTeacherApplications();
    }

    if (payload.marketplaceListed === true && !organization.marketplaceListed) {
      organization.listOnMarketPlace(payload.correlationId);
    } else if (payload.marketplaceListed === false && organization.marketplaceListed) {
      organization.delistFromMarket();
    }

    await this.organizationRepository.save(organization);

    return {
      organizationId: organization.getId(),
      acceptingTeachers: organization.acceptingTeachers,
      marketplaceListed: organization.marketplaceListed,
    };
  }
}
