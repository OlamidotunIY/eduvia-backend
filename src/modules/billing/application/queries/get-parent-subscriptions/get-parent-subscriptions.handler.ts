import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParentSubscriptionsQuery } from './get-parent-subscriptions.query';
import { ParentSubscriptionDto } from '../dto/parent-subscription.dto';
import { IParentSubscriptionRepository } from '../../../domain';

@QueryHandler(GetParentSubscriptionsQuery)
export class GetParentSubscriptionsHandler
  implements IQueryHandler<GetParentSubscriptionsQuery, ParentSubscriptionDto[]>
{
  constructor(private readonly subscriptionRepository: IParentSubscriptionRepository) {}

  async execute(query: GetParentSubscriptionsQuery): Promise<ParentSubscriptionDto[]> {
    const subscriptions = await this.subscriptionRepository.findByParentId(query.parentId);

    return subscriptions.map(
      (s) =>
        new ParentSubscriptionDto(
          s.id.toString(),
          s.orgId,
          s.planId.toString(),
          s.parentId,
          s.studentId,
          s.subjectId,
          s.provider,
          s.providerSubscriptionId,
          s.status,
          s.discountId ? s.discountId.toString() : null,
          s.effectivePriceAmount,
          s.currentPeriodStart,
          s.currentPeriodEnd,
          s.cancelledAt,
          s.cancelReason,
          s.createdAt,
          s.updatedAt,
        ),
    );
  }
}
