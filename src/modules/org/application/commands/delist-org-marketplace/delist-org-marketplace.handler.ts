import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DelistOrganizationFromMarketplaceCommand } from './delist-org-marketplace.command';
import { DelistOrganizationFromMarketplaceResult } from './delist-org-marketplace.result';
import {
  IOrganizationMembershipRepository,
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
} from '../../../domain';

@CommandHandler(DelistOrganizationFromMarketplaceCommand)
export class DelistOrganizationFromMarketplaceHandler
  implements ICommandHandler<DelistOrganizationFromMarketplaceCommand, DelistOrganizationFromMarketplaceResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: DelistOrganizationFromMarketplaceCommand,
  ): Promise<DelistOrganizationFromMarketplaceResult> {
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

    org.delistFromMarket();

    await this.orgRepository.save(org);

    return {
      id: org.getId(),
      marketplaceListed: org.marketplaceListed,
    };
  }
}
