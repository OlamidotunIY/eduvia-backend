import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddPlanDiscountCommand } from './add-plan-discount.command';
import {
  ISubscriptionPlanRepository,
  SubscriptionPlanNotFoundError,
  PlanDiscount,
} from '../../../domain';

@CommandHandler(AddPlanDiscountCommand)
export class AddPlanDiscountHandler implements ICommandHandler<AddPlanDiscountCommand, string> {
  constructor(private readonly planRepository: ISubscriptionPlanRepository) {}

  async execute(command: AddPlanDiscountCommand): Promise<string> {
    const plan = await this.planRepository.findById(command.planId);
    if (!plan || plan.orgId !== command.orgId) {
      throw new SubscriptionPlanNotFoundError(command.planId);
    }

    const discount = PlanDiscount.create({
      planId: plan.id,
      type: command.type,
      amount: command.amount,
      currency: command.currency,
      scope: command.scope,
      parentId: command.parentId,
      expiresAt: command.expiresAt,
      code: command.code,
    });

    plan.addDiscount(discount);
    await this.planRepository.save(plan);

    return discount.id.toString();
  }
}
