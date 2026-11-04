import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { UpdateOrganizationProfileCommand } from './update-org-profile.command';
import { UpdateOrganizationProfileResult } from './update-org-profile.result';
import {
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(UpdateOrganizationProfileCommand)
export class UpdateOrganizationProfileHandler
  implements ICommandHandler<UpdateOrganizationProfileCommand, UpdateOrganizationProfileResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: UpdateOrganizationProfileCommand,
  ): Promise<UpdateOrganizationProfileResult> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ORGANIZATION_UPDATE)) {
      throw new OrganizationInvariantError('Caller cannot update this organization');
    }

    const org = await this.orgRepository.findById(
      OrganizationId.from(payload.orgId),
    );
    if (!org) {
      throw new OrganizationNotFound();
    }

    org.updateProfile({
      name: payload.name,
      description: payload.description,
      logoUrl: payload.logoUrl,
      websiteUrl: payload.websiteUrl,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone,
      country: payload.country,
      timezone: payload.timezone,
      correlationId: payload.correlationId,
    });

    await this.orgRepository.save(org);

    return {
      id: org.getId(),
    };
  }
}
