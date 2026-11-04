import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { ListOrganizationOnMarketplaceCommand } from './list-org-marketplace.command';
import { ListOrganizationOnMarketplaceResult } from './list-org-marketplace.result';
import {
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(ListOrganizationOnMarketplaceCommand)
export class ListOrganizationOnMarketplaceHandler
  implements ICommandHandler<ListOrganizationOnMarketplaceCommand, ListOrganizationOnMarketplaceResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: ListOrganizationOnMarketplaceCommand,
  ): Promise<ListOrganizationOnMarketplaceResult> {
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

    org.listOnMarketPlace(payload.correlationId);

    await this.orgRepository.save(org);

    return {
      id: org.getId(),
      marketplaceListed: org.marketplaceListed,
    };
  }
}
