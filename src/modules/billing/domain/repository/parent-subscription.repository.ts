import { BaseRepository } from '@modules/shared/domain';
import { ParentSubscriptionId } from '../value-objects';
import { ParentSubscription } from '../model/ParentSubscription';

export abstract class IParentSubscriptionRepository extends BaseRepository<
  ParentSubscription,
  ParentSubscriptionId
> {
  public abstract findByParentId(parentId: string): Promise<ParentSubscription[]>;
  public abstract findByStudentId(studentId: string): Promise<ParentSubscription[]>;
  public abstract findByOrgId(orgId: string): Promise<ParentSubscription[]>;
  public abstract findByProviderSubscriptionId(
    providerSubscriptionId: string,
  ): Promise<ParentSubscription | null>;
  public abstract findActiveSubscription(
    parentId: string,
    studentId: string,
    subjectId: string,
    orgId: string,
  ): Promise<ParentSubscription | null>;
  public abstract findPastDueSubscriptions(): Promise<ParentSubscription[]>;
}
