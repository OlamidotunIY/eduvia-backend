import { ICommand } from '@nestjs/cqrs';
import { OrgPlanTier } from '../../../domain';

export class UpgradeOrgTierCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly newTier: OrgPlanTier,
  ) {}
}
