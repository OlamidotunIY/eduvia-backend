import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PauseParentSubscriptionCommand } from './pause-parent-subscription.command';
import {
  IParentSubscriptionRepository,
  ParentSubscriptionNotFoundError,
  InvalidBillingOperationError,
} from '../../../domain';

@CommandHandler(PauseParentSubscriptionCommand)
export class PauseParentSubscriptionHandler
  implements ICommandHandler<PauseParentSubscriptionCommand, void>
{
  constructor(private readonly subscriptionRepository: IParentSubscriptionRepository) {}

  async execute(command: PauseParentSubscriptionCommand): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(command.subscriptionId);
    if (!subscription) {
      throw new ParentSubscriptionNotFoundError(command.subscriptionId);
    }

    if (command.parentId && subscription.parentId !== command.parentId) {
      throw new InvalidBillingOperationError('You are not authorized to pause this subscription.');
    }

    subscription.pause();
    await this.subscriptionRepository.save(subscription);
  }
}
