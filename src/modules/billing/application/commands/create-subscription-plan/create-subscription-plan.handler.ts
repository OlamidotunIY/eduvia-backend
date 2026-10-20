import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSubscriptionPlanCommand } from './create-subscription-plan.command';
import {
  ISubscriptionPlanRepository,
  IOrgBillingAccountRepository,
  SubscriptionPlan,
  OrgBillingAccountNotFoundError,
  UnconnectedPaymentProviderError,
  BillingModel,
} from '../../../domain';

@CommandHandler(CreateSubscriptionPlanCommand)
export class CreateSubscriptionPlanHandler
  implements ICommandHandler<CreateSubscriptionPlanCommand, string>
{
  constructor(
    private readonly planRepository: ISubscriptionPlanRepository,
    private readonly accountRepository: IOrgBillingAccountRepository,
  ) {}

  async execute(command: CreateSubscriptionPlanCommand): Promise<string> {
    const account = await this.accountRepository.findByOrgId(command.orgId);
    if (!account) {
      throw new OrgBillingAccountNotFoundError(command.orgId);
    }

    if (account.billingModel === BillingModel.marketplace && !account.canCreateMarketplacePlan()) {
      throw new UnconnectedPaymentProviderError(command.orgId);
    }

    const plan = SubscriptionPlan.create({
      orgId: command.orgId,
      subjectId: command.subjectId,
      name: command.name,
      description: command.description,
      priceAmount: command.priceAmount,
      currency: command.currency,
      billingInterval: command.billingInterval,
      lessonsPerInterval: command.lessonsPerInterval,
    });

    await this.planRepository.save(plan);
    return plan.id.toString();
  }
}
