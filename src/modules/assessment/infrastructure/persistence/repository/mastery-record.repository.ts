import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  MasteryRecord,
  MasteryRecordId,
  IMasteryRecordRepository,
} from '../../../domain';
import { MasteryRecordMapper } from '../mappers/mastery-record.mapper';
import { MasteryHistoryEntryMapper } from '../mappers/mastery-history-entry.mapper';

@Injectable()
export class PrismaMasteryRecordRepository implements IMasteryRecordRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: MasteryRecordMapper,
    private readonly entryMapper: MasteryHistoryEntryMapper,
  ) {}

  public async findById(id: MasteryRecordId | string): Promise<MasteryRecord | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.masteryRecord.findUnique({
      where: { id: rawId },
      include: { history: { orderBy: { recordedAt: 'asc' } } },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<MasteryRecord[]> {
    const records = await this.prisma.masteryRecord.findMany({
      include: { history: { orderBy: { recordedAt: 'asc' } } },
      orderBy: { lastUpdatedAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: MasteryRecord): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const recordId = entity.id.unpack();

    await this.prisma.$transaction(async (tx) => {
      await tx.masteryRecord.upsert({
        where: { id: recordId },
        create: {
          id: recordId,
          ...data,
        },
        update: data,
      });

      for (const entry of entity.history) {
        const entryData = this.entryMapper.toPersistence(entry);
        const entryId = entry.id.unpack();
        await tx.masteryHistoryEntry.upsert({
          where: { id: entryId },
          create: {
            id: entryId,
            ...entryData,
          },
          update: entryData,
        });
      }
    });
  }

  public async delete(id: MasteryRecordId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.masteryRecord.delete({
      where: { id: rawId },
    });
  }

  public async findByStudentAndNode(
    studentId: string,
    curriculumNodeId: string,
    orgId: string,
  ): Promise<MasteryRecord | null> {
    const record = await this.prisma.masteryRecord.findUnique({
      where: {
        studentId_curriculumNodeId_orgId: {
          studentId,
          curriculumNodeId,
          orgId,
        },
      },
      include: { history: { orderBy: { recordedAt: 'asc' } } },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findByStudentId(
    studentId: string,
    orgId?: string,
  ): Promise<MasteryRecord[]> {
    const where: any = { studentId };
    if (orgId) {
      where.orgId = orgId;
    }

    const records = await this.prisma.masteryRecord.findMany({
      where,
      include: { history: { orderBy: { recordedAt: 'asc' } } },
      orderBy: { lastUpdatedAt: 'desc' },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }
}
