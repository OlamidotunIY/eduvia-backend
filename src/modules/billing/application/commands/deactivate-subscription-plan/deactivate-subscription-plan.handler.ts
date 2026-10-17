import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeactivateSubscriptionPlanCommand } from './deactivate-subscription-plan.command';
import {
  ISubscriptionPlanRepository,
  SubscriptionPlanNotFoundError,
} from '../../../domain';

@CommandHandler(DeactivateSubscriptionPlanCommand)
export class DeactivateSubscriptionPlanHandler
  implements ICommandHandler<DeactivateSubscriptionPlanCommand, void>
{
  constructor(private readonly planRepository: ISubscriptionPlanRepository) {}

  async execute(command: DeactivateSubscriptionPlanCommand): Promise<void> {
    const plan = await this.planRepository.findById(command.planId);
    if (!plan || plan.orgId !== command.orgId) {
      throw new SubscriptionPlanNotFoundError(command.planId);
    }

    plan.deactivate();
    await this.planRepository.save(plan);
  }
}
