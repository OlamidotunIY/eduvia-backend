import { BaseRepository } from '@modules/shared/domain';
import { SeatUsageRecordId } from '../value-objects';
import { SeatUsageRecord } from '../entities/seat-usage-record.entity';

export abstract class ISeatUsageRecordRepository extends BaseRepository<
  SeatUsageRecord,
  SeatUsageRecordId
> {
  public abstract findByOrgAndMonth(orgId: string, month: string): Promise<SeatUsageRecord | null>;
  public abstract findUninvoicedByMonth(month: string): Promise<SeatUsageRecord[]>;
}
