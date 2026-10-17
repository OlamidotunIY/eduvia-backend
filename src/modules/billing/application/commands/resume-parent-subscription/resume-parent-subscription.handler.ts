import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResumeParentSubscriptionCommand } from './resume-parent-subscription.command';
import {
  IParentSubscriptionRepository,
  ParentSubscriptionNotFoundError,
  InvalidBillingOperationError,
} from '../../../domain';

@CommandHandler(ResumeParentSubscriptionCommand)
export class ResumeParentSubscriptionHandler
  implements ICommandHandler<ResumeParentSubscriptionCommand, void>
{
  constructor(private readonly subscriptionRepository: IParentSubscriptionRepository) {}

  async execute(command: ResumeParentSubscriptionCommand): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(command.subscriptionId);
    if (!subscription) {
      throw new ParentSubscriptionNotFoundError(command.subscriptionId);
    }

    if (command.parentId && subscription.parentId !== command.parentId) {
      throw new InvalidBillingOperationError('You are not authorized to resume this subscription.');
    }

    subscription.resume();
    await this.subscriptionRepository.save(subscription);
  }
}
