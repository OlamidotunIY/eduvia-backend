import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscribeParentCommand } from './subscribe-parent.command';
import {
  IParentSubscriptionRepository,
  ISubscriptionPlanRepository,
  ParentSubscription,
  SubscriptionPlanNotFoundError,
  DuplicateSubscriptionError,
} from '../../../domain';

@CommandHandler(SubscribeParentCommand)
export class SubscribeParentHandler implements ICommandHandler<SubscribeParentCommand, string> {
  constructor(
    private readonly subscriptionRepository: IParentSubscriptionRepository,
    private readonly planRepository: ISubscriptionPlanRepository,
  ) {}

  async execute(command: SubscribeParentCommand): Promise<string> {
    const plan = await this.planRepository.findById(command.planId);
    if (!plan || plan.orgId !== command.orgId || !plan.isActive) {
      throw new SubscriptionPlanNotFoundError(command.planId);
    }

    const existingActive = await this.subscriptionRepository.findActiveSubscription(
      command.parentId,
      command.studentId,
      plan.subjectId,
      command.orgId,
    );
    if (existingActive) {
      throw new DuplicateSubscriptionError(command.studentId, plan.subjectId);
    }

    const { discount, effectivePrice } = plan.applyDiscount(
      command.parentId,
      command.discountCode,
    );

    const now = new Date();
    const periodEnd = new Date(now.getTime() + command.durationDays * 24 * 60 * 60 * 1000);

    const subscription = ParentSubscription.create({
      orgId: command.orgId,
      planId: plan.id,
      parentId: command.parentId,
      studentId: command.studentId,
      subjectId: plan.subjectId,
      provider: command.provider,
      providerSubscriptionId: command.providerSubscriptionId,
      discountId: discount ? discount.id : null,
      effectivePriceAmount: effectivePrice,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });

    await this.subscriptionRepository.save(subscription);
    return subscription.id.toString();
  }
}
