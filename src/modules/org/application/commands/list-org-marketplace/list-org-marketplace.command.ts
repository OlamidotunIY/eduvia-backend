import { Command } from '@nestjs/cqrs';
import { ListOrganizationOnMarketplaceResult } from './list-org-marketplace.result';

export class ListOrganizationOnMarketplaceCommand extends Command<ListOrganizationOnMarketplaceResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
