import { ICommand } from '@nestjs/cqrs';
import { BillingEventType, PaymentProvider } from '../../../domain';

export class ProcessBillingWebhookCommand implements ICommand {
  constructor(
    public readonly provider: PaymentProvider,
    public readonly providerEventId: string,
    public readonly eventType: BillingEventType,
    public readonly orgId: string,
    public readonly subscriptionId?: string,
    public readonly providerSubscriptionId?: string,
    public readonly amount?: number,
    public readonly currency?: string,
    public readonly metadata: Record<string, any> = {},
    public readonly durationDays: number = 30,
  ) {}
}
