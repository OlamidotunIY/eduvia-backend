import { BaseEntityId } from '@modules/shared/domain';

export class OrgBillingAccountId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrgBillingAccountId {
    return new OrgBillingAccountId(this.nextValue());
  }

  public static from(value: string): OrgBillingAccountId {
    return new OrgBillingAccountId(value);
  }
}
