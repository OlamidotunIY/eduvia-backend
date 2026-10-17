import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  SeatUsageRecord,
  SeatUsageRecordId,
} from '../../../domain';
import { SeatUsageRecord as PrismaSeatUsageRecord } from '@generated/prisma/client';

@Injectable()
export class SeatUsageRecordMapper implements IMapper<SeatUsageRecord, PrismaSeatUsageRecord> {
  toDomain(record: PrismaSeatUsageRecord): SeatUsageRecord {
    return SeatUsageRecord.reconstitute({
      id: SeatUsageRecordId.from(record.id),
      orgId: record.orgId,
      month: record.month,
      seatCount: record.seatCount,
      tierAtTime: record.tierAtTime,
      invoicedAt: record.invoicedAt,
      createdAt: record.createdAt,
    });
  }

  toPersistence(entity: SeatUsageRecord): PrismaSeatUsageRecord {
    return {
      id: entity.id.toString(),
      orgId: entity.orgId,
      month: entity.month,
      seatCount: entity.seatCount,
      tierAtTime: entity.tierAtTime,
      invoicedAt: entity.invoicedAt,
      createdAt: entity.createdAt,
    };
  }
}
