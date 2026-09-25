import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './create-organization.command';
import { CreateOrganizationResult } from './create-organization.result';
import { IOrganizationRepository, Organization } from '../../../domain';
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
      throw new Error('User not found');
    }

    if (user.userType !== UserType.TEACHER) {
      throw new Error('User cannot create Organization');
    }

    const organization = Organization.create({
      ownerId: payload.ownerId,
      name: payload.name,
      slug: payload.slug,
      contactEmail: payload.contactEmail,
      correlationId: payload.correlationId,
    });
    await this.organizationRepository.save(organization);

    return {
      id: organization.getId(),
    };
  }
}
