import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrgBillingAccountQuery } from './get-org-billing-account.query';
import { OrgBillingAccountDto } from '../dto/org-billing-account.dto';
import {
  IOrgBillingAccountRepository,
  OrgBillingAccountNotFoundError,
} from '../../../domain';

@QueryHandler(GetOrgBillingAccountQuery)
export class GetOrgBillingAccountHandler
  implements IQueryHandler<GetOrgBillingAccountQuery, OrgBillingAccountDto>
{
  constructor(private readonly accountRepository: IOrgBillingAccountRepository) {}

  async execute(query: GetOrgBillingAccountQuery): Promise<OrgBillingAccountDto> {
    const account = await this.accountRepository.findByOrgId(query.orgId);
    if (!account) {
      throw new OrgBillingAccountNotFoundError(query.orgId);
    }

    return new OrgBillingAccountDto(
      account.id.toString(),
      account.orgId,
      account.billingModel,
      account.stripeAccountId,
      account.paypalMerchantId,
      account.paymentProvider,
      account.stripeCustomerId,
      account.seatCount,
      account.freeTierActive,
      account.planTier,
      account.currentPeriodEnd,
      account.status,
      account.createdAt,
      account.updatedAt,
    );
  }
}
