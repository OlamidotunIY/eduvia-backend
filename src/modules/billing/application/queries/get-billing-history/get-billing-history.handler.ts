import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBillingHistoryQuery } from './get-billing-history.query';
import { BillingEventDto } from '../dto/billing-event.dto';
import { IBillingEventRepository } from '../../../domain';

@QueryHandler(GetBillingHistoryQuery)
export class GetBillingHistoryHandler
  implements IQueryHandler<GetBillingHistoryQuery, BillingEventDto[]>
{
  constructor(private readonly billingEventRepository: IBillingEventRepository) {}

  async execute(query: GetBillingHistoryQuery): Promise<BillingEventDto[]> {
    const events = query.subscriptionId
      ? await this.billingEventRepository.findBySubscriptionId(query.subscriptionId)
      : await this.billingEventRepository.findByOrgId(query.orgId, query.limit);

    return events.map(
      (e) =>
        new BillingEventDto(
          e.id.toString(),
          e.orgId,
          e.subscriptionId,
          e.type,
          e.provider,
          e.providerEventId,
          e.amount,
          e.currency,
          e.metadata,
          e.occurredAt,
          e.createdAt,
        ),
    );
  }
}
