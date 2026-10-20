import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessBillingWebhookCommand } from './process-billing-webhook.command';
import {
  IBillingEventRepository,
  IParentSubscriptionRepository,
  BillingEvent,
  BillingEventType,
} from '../../../domain';

@CommandHandler(ProcessBillingWebhookCommand)
export class ProcessBillingWebhookHandler
  implements ICommandHandler<ProcessBillingWebhookCommand, string>
{
  constructor(
    private readonly billingEventRepository: IBillingEventRepository,
    private readonly subscriptionRepository: IParentSubscriptionRepository,
  ) {}

  async execute(command: ProcessBillingWebhookCommand): Promise<string> {
    const existing = await this.billingEventRepository.findByProviderEventId(
      command.providerEventId,
    );
    if (existing) {
      return existing.id.toString();
    }

    let subscription = null;
    if (command.subscriptionId) {
      subscription = await this.subscriptionRepository.findById(command.subscriptionId);
    } else if (command.providerSubscriptionId) {
      subscription = await this.subscriptionRepository.findByProviderSubscriptionId(
        command.providerSubscriptionId,
      );
    }

    const event = BillingEvent.create({
      orgId: command.orgId,
      subscriptionId: subscription ? subscription.id.toString() : command.subscriptionId,
      type: command.eventType,
      provider: command.provider,
      providerEventId: command.providerEventId,
      amount: command.amount,
      currency: command.currency,
      metadata: command.metadata,
    });

    await this.billingEventRepository.save(event);

    if (subscription) {
      if (command.eventType === BillingEventType.subscription_renewed) {
        const currentEnd = subscription.currentPeriodEnd;
        const newEnd = new Date(currentEnd.getTime() + command.durationDays * 24 * 60 * 60 * 1000);
        subscription.renew(newEnd);
        await this.subscriptionRepository.save(subscription);
      } else if (command.eventType === BillingEventType.payment_failed) {
        subscription.markPastDue();
        await this.subscriptionRepository.save(subscription);
      } else if (command.eventType === BillingEventType.subscription_cancelled) {
        subscription.cancel('Cancelled via provider webhook');
        await this.subscriptionRepository.save(subscription);
      }
    }

    return event.id.toString();
  }
}
