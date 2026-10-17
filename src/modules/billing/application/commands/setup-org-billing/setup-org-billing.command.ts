import { ICommand } from '@nestjs/cqrs';
import { BillingModel, OrgPlanTier } from '../../../domain';

export class SetupOrgBillingCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly billingModel: BillingModel,
    public readonly planTier?: OrgPlanTier,
  ) {}
}
