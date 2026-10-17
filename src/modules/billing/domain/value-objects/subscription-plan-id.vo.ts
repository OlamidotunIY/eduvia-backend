import { BaseEntityId } from '@modules/shared/domain';

export class SubscriptionPlanId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): SubscriptionPlanId {
    return new SubscriptionPlanId(this.nextValue());
  }

  public static from(value: string): SubscriptionPlanId {
    return new SubscriptionPlanId(value);
  }
}
