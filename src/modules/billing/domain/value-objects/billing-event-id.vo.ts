import { BaseEntityId } from '@modules/shared/domain';

export class BillingEventId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): BillingEventId {
    return new BillingEventId(this.nextValue());
  }

  public static from(value: string): BillingEventId {
    return new BillingEventId(value);
  }
}
