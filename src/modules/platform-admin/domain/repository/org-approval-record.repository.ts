import { BaseRepository } from '@modules/shared/domain';
import { OrgApprovalRecordId } from '../value-objects';
import { OrgApprovalRecord } from '../model/OrgApprovalRecord';

export abstract class IOrgApprovalRecordRepository extends BaseRepository<
  OrgApprovalRecord,
  OrgApprovalRecordId
> {
  public abstract findByOrgId(orgId: string): Promise<OrgApprovalRecord[]>;
  public abstract findLatestByOrgId(orgId: string): Promise<OrgApprovalRecord | null>;
}
