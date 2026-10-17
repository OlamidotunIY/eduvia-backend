import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelParentSubscriptionCommand } from './cancel-parent-subscription.command';
import {
  IParentSubscriptionRepository,
  ParentSubscriptionNotFoundError,
  InvalidBillingOperationError,
} from '../../../domain';

@CommandHandler(CancelParentSubscriptionCommand)
export class CancelParentSubscriptionHandler
  implements ICommandHandler<CancelParentSubscriptionCommand, void>
{
  constructor(private readonly subscriptionRepository: IParentSubscriptionRepository) {}

  async execute(command: CancelParentSubscriptionCommand): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(command.subscriptionId);
    if (!subscription) {
      throw new ParentSubscriptionNotFoundError(command.subscriptionId);
    }

    if (command.parentId && subscription.parentId !== command.parentId) {
      throw new InvalidBillingOperationError('You are not authorized to cancel this subscription.');
    }

    subscription.cancel(command.reason);
    await this.subscriptionRepository.save(subscription);
  }
}
