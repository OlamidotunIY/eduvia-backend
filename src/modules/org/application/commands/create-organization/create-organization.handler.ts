import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './create-organization.command';
import { CreateOrganizationResult } from './create-organization.result';
import { IOrganizationRepository, Organization, OrganizationUserNotFound, UserCannotCreateOrganization } from '../../../domain';
import { IUserQueryPort, UserType } from '@modules/shared';

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler implements ICommandHandler<
  CreateOrganizationCommand,
  CreateOrganizationResult
> {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private userQueryPort: IUserQueryPort,
  ) {}

  async execute(
    command: CreateOrganizationCommand,
  ): Promise<CreateOrganizationResult> {
    const { payload } = command;
    const user = await this.userQueryPort.getUserById(payload.ownerId);
    if (!user) {
      throw new OrganizationUserNotFound();
    }

    if (user.userType !== UserType.TEACHER) {
      throw new UserCannotCreateOrganization();
    }

    const organization = Organization.create({
      ownerId: payload.ownerId,
      name: payload.name,
      slug: payload.slug,
      contactEmail: payload.contactEmail,
      country: payload.country,
      timezone: payload.timezone,
      correlationId: payload.correlationId,
    });
    await this.organizationRepository.save(organization);

    return {
      id: organization.getId(),
    };
  }
}
