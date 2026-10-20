import { BaseEntityId } from '@modules/shared/domain';

export class OrgApprovalRecordId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrgApprovalRecordId {
    return new OrgApprovalRecordId(this.nextValue());
  }

  public static from(value: string): OrgApprovalRecordId {
    return new OrgApprovalRecordId(value);
  }
}
