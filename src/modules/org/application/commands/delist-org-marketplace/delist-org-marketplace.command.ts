import { Command } from '@nestjs/cqrs';
import { DelistOrganizationFromMarketplaceResult } from './delist-org-marketplace.result';

export class DelistOrganizationFromMarketplaceCommand extends Command<DelistOrganizationFromMarketplaceResult> {
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
