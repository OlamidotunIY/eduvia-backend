import { BaseEntityId } from '@modules/shared/domain';

export class ParentSubscriptionId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): ParentSubscriptionId {
    return new ParentSubscriptionId(this.nextValue());
  }

  public static from(value: string): ParentSubscriptionId {
    return new ParentSubscriptionId(value);
  }
}
