import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationMembershipCommand } from './create-organization-membership.command';
import { CreateOrganizationMembershipResult } from './create-organization-membership.result';
import { IOrganizationMembershipRepository } from '../../../domain/repository';
import { OrganizationMembership } from '../../../domain/model';

@CommandHandler(CreateOrganizationMembershipCommand)
export class CreateOrganizationMembershipHandler
  implements ICommandHandler<CreateOrganizationMembershipCommand, CreateOrganizationMembershipResult>
{
  constructor(
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: CreateOrganizationMembershipCommand,
  ): Promise<CreateOrganizationMembershipResult> {
    const { payload } = command;

    const membership = OrganizationMembership.create({
      orgId: payload.orgId,
      userId: payload.userId,
      role: payload.role,
      subjects: payload.subjects,
    });

    await this.membershipRepository.save(membership);

    return {
      id: membership.id.value,
    };
  }
}
