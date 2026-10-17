import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSubscriptionPlanQuery } from './get-subscription-plan.query';
import { SubscriptionPlanDto, PlanDiscountDto } from '../dto/subscription-plan.dto';
import {
  ISubscriptionPlanRepository,
  SubscriptionPlanNotFoundError,
} from '../../../domain';

@QueryHandler(GetSubscriptionPlanQuery)
export class GetSubscriptionPlanHandler
  implements IQueryHandler<GetSubscriptionPlanQuery, SubscriptionPlanDto>
{
  constructor(private readonly planRepository: ISubscriptionPlanRepository) {}

  async execute(query: GetSubscriptionPlanQuery): Promise<SubscriptionPlanDto> {
    const plan = await this.planRepository.findById(query.planId);
    if (!plan) {
      throw new SubscriptionPlanNotFoundError(query.planId);
    }

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
  }
}
