import { BaseRepository } from '@modules/shared/domain';
import { OrgBillingAccountId } from '../value-objects';
import { OrgBillingAccount } from '../model/OrgBillingAccount';

export abstract class IOrgBillingAccountRepository extends BaseRepository<
  OrgBillingAccount,
  OrgBillingAccountId
> {
  public abstract findByOrgId(orgId: string): Promise<OrgBillingAccount | null>;
  public abstract findByStripeCustomerId(customerId: string): Promise<OrgBillingAccount | null>;
  public abstract findByStripeAccountId(accountId: string): Promise<OrgBillingAccount | null>;
}
