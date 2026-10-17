import { BaseRepository } from '@modules/shared/domain';
import { BillingEventId } from '../value-objects';
import { BillingEvent } from '../model/BillingEvent';

export abstract class IBillingEventRepository extends BaseRepository<
  BillingEvent,
  BillingEventId
> {
  public abstract findByProviderEventId(providerEventId: string): Promise<BillingEvent | null>;
  public abstract findByOrgId(orgId: string, limit?: number): Promise<BillingEvent[]>;
  public abstract findBySubscriptionId(subscriptionId: string): Promise<BillingEvent[]>;
}
