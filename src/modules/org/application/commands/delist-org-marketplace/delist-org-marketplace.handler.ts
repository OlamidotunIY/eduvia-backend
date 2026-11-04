import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { DelistOrganizationFromMarketplaceCommand } from './delist-org-marketplace.command';
import { DelistOrganizationFromMarketplaceResult } from './delist-org-marketplace.result';
import {
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(DelistOrganizationFromMarketplaceCommand)
export class DelistOrganizationFromMarketplaceHandler
  implements ICommandHandler<DelistOrganizationFromMarketplaceCommand, DelistOrganizationFromMarketplaceResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: DelistOrganizationFromMarketplaceCommand,
  ): Promise<DelistOrganizationFromMarketplaceResult> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ORGANIZATION_MARKETPLACE_MANAGE)) {
      throw new OrganizationInvariantError('Caller cannot manage organization marketplace listing');
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
