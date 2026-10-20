import { ICommand } from '@nestjs/cqrs';
import { PaymentProvider } from '../../../domain';

export class SubscribeParentCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly planId: string,
    public readonly parentId: string,
    public readonly studentId: string,
    public readonly provider: PaymentProvider,
    public readonly providerSubscriptionId: string,
    public readonly discountCode?: string,
    public readonly durationDays: number = 30,
  ) {}
}
