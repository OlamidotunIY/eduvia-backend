import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationProfileCommand } from './update-org-profile.command';
import { UpdateOrganizationProfileResult } from './update-org-profile.result';
import {
  IOrganizationMembershipRepository,
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
} from '../../../domain';

@CommandHandler(UpdateOrganizationProfileCommand)
export class UpdateOrganizationProfileHandler
  implements ICommandHandler<UpdateOrganizationProfileCommand, UpdateOrganizationProfileResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: UpdateOrganizationProfileCommand,
  ): Promise<UpdateOrganizationProfileResult> {
    const { payload } = command;

    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.callerUserId,
    );

    if (!membership || !membership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
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
