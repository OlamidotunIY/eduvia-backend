import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  MarkingItem,
  MarkingItemId,
  IMarkingItemRepository,
  MarkingStatus,
} from '../../../domain';
import { MarkingItemMapper } from '../mappers/marking-item.mapper';

@Injectable()
export class PrismaMarkingItemRepository implements IMarkingItemRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: MarkingItemMapper,
  ) {}

  public async findById(id: MarkingItemId | string): Promise<MarkingItem | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.markingItem.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<MarkingItem[]> {
    const records = await this.prisma.markingItem.findMany();
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: MarkingItem): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const itemId = entity.id.unpack();
    await this.prisma.markingItem.upsert({
      where: { id: itemId },
      create: {
        id: itemId,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: MarkingItemId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.markingItem.delete({
      where: { id: rawId },
    });
  }

  public async findByAssessmentId(assessmentId: string): Promise<MarkingItem[]> {
    const records = await this.prisma.markingItem.findMany({
      where: { assessmentId },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findPendingByTeacher(
    _teacherId: string,
    orgId: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<MarkingItem[]> {
    const records = await this.prisma.markingItem.findMany({
      where: {
        status: MarkingStatus.pending,
        assessment: { orgId },
      },
      skip: pagination?.skip,
      take: pagination?.take,
    });
    return records.map((record) => this.mapper.toDomain(record));
  }
}
