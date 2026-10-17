import { BaseEntityId } from '@modules/shared/domain';

export class PlanDiscountId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): PlanDiscountId {
    return new PlanDiscountId(this.nextValue());
  }

  public static from(value: string): PlanDiscountId {
    return new PlanDiscountId(value);
  }
}
