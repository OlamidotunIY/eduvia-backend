import { BaseEntityId } from '@modules/shared';

export class OrgAnalyticsSnapshotId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrgAnalyticsSnapshotId {
    return new OrgAnalyticsSnapshotId(this.nextValue());
  }

  public static from(value: string): OrgAnalyticsSnapshotId {
    return new OrgAnalyticsSnapshotId(value);
  }
}
