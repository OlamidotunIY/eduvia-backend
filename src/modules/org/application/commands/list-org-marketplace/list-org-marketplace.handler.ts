import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ListOrganizationOnMarketplaceCommand } from './list-org-marketplace.command';
import { ListOrganizationOnMarketplaceResult } from './list-org-marketplace.result';
import {
  IOrganizationMembershipRepository,
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
} from '../../../domain';

@CommandHandler(ListOrganizationOnMarketplaceCommand)
export class ListOrganizationOnMarketplaceHandler
  implements ICommandHandler<ListOrganizationOnMarketplaceCommand, ListOrganizationOnMarketplaceResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: ListOrganizationOnMarketplaceCommand,
  ): Promise<ListOrganizationOnMarketplaceResult> {
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

    org.listOnMarketPlace(payload.correlationId);

    await this.orgRepository.save(org);

    return {
      id: org.getId(),
      marketplaceListed: org.marketplaceListed,
    };
  }
}
