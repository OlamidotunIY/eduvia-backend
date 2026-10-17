import { BaseRepository } from '@modules/shared/domain';
import { SubscriptionPlanId } from '../value-objects';
import { SubscriptionPlan } from '../model/SubscriptionPlan';

export abstract class ISubscriptionPlanRepository extends BaseRepository<
  SubscriptionPlan,
  SubscriptionPlanId
> {
  public abstract findByOrgId(orgId: string, activeOnly?: boolean): Promise<SubscriptionPlan[]>;
  public abstract findBySubjectId(orgId: string, subjectId: string): Promise<SubscriptionPlan[]>;
}
