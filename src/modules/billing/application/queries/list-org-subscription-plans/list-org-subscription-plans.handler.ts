import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOrgSubscriptionPlansQuery } from './list-org-subscription-plans.query';
import { SubscriptionPlanDto, PlanDiscountDto } from '../dto/subscription-plan.dto';
import { ISubscriptionPlanRepository } from '../../../domain';

@QueryHandler(ListOrgSubscriptionPlansQuery)
export class ListOrgSubscriptionPlansHandler
  implements IQueryHandler<ListOrgSubscriptionPlansQuery, SubscriptionPlanDto[]>
{
  constructor(private readonly planRepository: ISubscriptionPlanRepository) {}

  async execute(query: ListOrgSubscriptionPlansQuery): Promise<SubscriptionPlanDto[]> {
    const plans = await this.planRepository.findByOrgId(query.orgId, query.activeOnly);

    return plans.map((plan) => {
      const discounts = plan.discounts.map(
        (d) =>
          new PlanDiscountDto(
            d.id.toString(),
            d.planId.toString(),
            d.type,
            d.amount,
            d.currency,
            d.scope,
            d.parentId,
            d.expiresAt,
            d.isActive,
            d.code,
            d.createdAt,
          ),
      );

      return new SubscriptionPlanDto(
        plan.id.toString(),
        plan.orgId,
        plan.subjectId,
        plan.name,
        plan.description,
        plan.priceAmount,
        plan.currency,
        plan.billingInterval,
        plan.lessonsPerInterval,
        plan.isActive,
        plan.stripePriceId,
        plan.paypalPlanId,
        discounts,
        plan.createdAt,
        plan.updatedAt,
      );
    });
  }
}
