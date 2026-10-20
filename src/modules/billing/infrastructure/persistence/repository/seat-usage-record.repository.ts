import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  SeatUsageRecord,
  SeatUsageRecordId,
  ISeatUsageRecordRepository,
} from '../../../domain';
import { SeatUsageRecord as PrismaSeatUsageRecord } from '@generated/prisma/client';
import { SeatUsageRecordMapper } from '../mappers/seat-usage-record.mapper';

@Injectable()
export class PrismaSeatUsageRecordRepository
  extends PrismaBaseRepository<SeatUsageRecordId, SeatUsageRecord, PrismaSeatUsageRecord>
  implements ISeatUsageRecordRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly recordMapper: SeatUsageRecordMapper,
  ) {
    super(prisma, recordMapper);
  }

  protected get delegate() {
    return this.prisma.seatUsageRecord;
  }

  public override async findById(id: SeatUsageRecordId | string): Promise<SeatUsageRecord | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.seatUsageRecord.findUnique({
      where: { id: rawId },
    });
    return record ? this.recordMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<SeatUsageRecord[]> {
    const records = await this.prisma.seatUsageRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.recordMapper.toDomain(record));
  }

  public async findByOrgAndMonth(orgId: string, month: string): Promise<SeatUsageRecord | null> {
    const record = await this.prisma.seatUsageRecord.findUnique({
      where: {
        orgId_month: {
          orgId,
          month,
        },
      },
    });
    return record ? this.recordMapper.toDomain(record) : null;
  }

  public async findUninvoicedByMonth(month: string): Promise<SeatUsageRecord[]> {
    const records = await this.prisma.seatUsageRecord.findMany({
      where: {
        month,
        invoicedAt: null,
      },
    });
    return records.map((r) => this.recordMapper.toDomain(r));
  }

  public override async save(entity: SeatUsageRecord): Promise<void> {
    const data = this.recordMapper.toPersistence(entity);
    const recordId = entity.id.unpack();

    await this.prisma.seatUsageRecord.upsert({
      where: { id: recordId },
      create: {
        id: recordId,
        ...data,
      },
      update: data,
    });
  }

  public override async delete(id: SeatUsageRecordId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.seatUsageRecord.delete({
      where: { id: rawId },
    });
  }
}
