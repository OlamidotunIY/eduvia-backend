import { ICommand } from '@nestjs/cqrs';
import { BillingInterval } from '../../../domain';

export class CreateSubscriptionPlanCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly subjectId: string,
    public readonly name: string,
    public readonly priceAmount: number,
    public readonly currency: string,
    public readonly billingInterval: BillingInterval,
    public readonly lessonsPerInterval: number,
    public readonly description?: string,
  ) {}
}
