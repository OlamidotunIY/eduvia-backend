import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParentSubscriptionByIdQuery } from './get-parent-subscription-by-id.query';
import { ParentSubscriptionDto } from '../dto/parent-subscription.dto';
import {
  IParentSubscriptionRepository,
  ParentSubscriptionNotFoundError,
} from '../../../domain';

@QueryHandler(GetParentSubscriptionByIdQuery)
export class GetParentSubscriptionByIdHandler
  implements IQueryHandler<GetParentSubscriptionByIdQuery, ParentSubscriptionDto>
{
  constructor(private readonly subscriptionRepository: IParentSubscriptionRepository) {}

  async execute(query: GetParentSubscriptionByIdQuery): Promise<ParentSubscriptionDto> {
    const s = await this.subscriptionRepository.findById(query.subscriptionId);
    if (!s) {
      throw new ParentSubscriptionNotFoundError(query.subscriptionId);
    }

    return new ParentSubscriptionDto(
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
    );
  }
}
