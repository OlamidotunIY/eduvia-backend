import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SelectActiveOrganizationCommand } from './select-active-organization.command';
import { SelectActiveOrganizationResult } from './select-active-organization.result';
import { IOrganizationMembershipRepository } from '../../../domain/repository';

@CommandHandler(SelectActiveOrganizationCommand)
export class SelectActiveOrganizationHandler implements ICommandHandler<SelectActiveOrganizationCommand, SelectActiveOrganizationResult> {
  constructor(
    private readonly organizationMembershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(command: SelectActiveOrganizationCommand): Promise<SelectActiveOrganizationResult> {
    const { payload } = command;

    const membership = await this.organizationMembershipRepository.findByOrgIdAndUserId(
      payload.organizationId,
      payload.userId,
    );
    if (!membership || !membership.isActive()) {
      throw new Error('You are not an active member of this organization');
    }
    membership.selectAsActive(payload.correlationId);
    await this.organizationMembershipRepository.save(membership);

    return {
      organizationId: payload.organizationId,
    };
  }
}
