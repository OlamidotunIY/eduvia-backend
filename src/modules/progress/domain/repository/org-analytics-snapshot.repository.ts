import { BaseRepository } from '@modules/shared';
import { OrgAnalyticsSnapshotId } from '../value-objects';
import { OrgAnalyticsSnapshot } from '../model/OrgAnalyticsSnapshot';

export abstract class IOrgAnalyticsSnapshotRepository extends BaseRepository<
  OrgAnalyticsSnapshot,
  OrgAnalyticsSnapshotId
> {
  public abstract findLatestByOrg(orgId: string): Promise<OrgAnalyticsSnapshot | null>;

  public abstract findByOrgAndDate(
    orgId: string,
    date: Date,
  ): Promise<OrgAnalyticsSnapshot | null>;

  public abstract findHistoryByOrg(
    orgId: string,
    limit?: number,
  ): Promise<OrgAnalyticsSnapshot[]>;
}
