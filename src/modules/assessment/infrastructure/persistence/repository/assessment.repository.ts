import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Assessment,
  AssessmentId,
  IAssessmentRepository,
  AssessmentFilter,
} from '../../../domain';
import { AssessmentMapper } from '../mappers/assessment.mapper';
import { MarkingItemMapper } from '../mappers/marking-item.mapper';

@Injectable()
export class PrismaAssessmentRepository implements IAssessmentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AssessmentMapper,
    private readonly itemMapper: MarkingItemMapper,
  ) {}

  public async findById(id: AssessmentId | string): Promise<Assessment | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.assessment.findUnique({
      where: { id: rawId },
      include: { markingItems: true },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<Assessment[]> {
    const records = await this.prisma.assessment.findMany({
      include: { markingItems: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: Assessment): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const assessmentId = entity.id.unpack();

    await this.prisma.$transaction(async (tx) => {
      await tx.assessment.upsert({
        where: { id: assessmentId },
        create: {
          id: assessmentId,
          ...data,
        },
        update: data,
      });

      for (const item of entity.markingItems) {
        const itemData = this.itemMapper.toPersistence(item);
        const itemId = item.id.unpack();
        await tx.markingItem.upsert({
          where: { id: itemId },
          create: {
            id: itemId,
            ...itemData,
          },
          update: itemData,
        });
      }
    });
  }

  public async delete(id: AssessmentId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.assessment.delete({
      where: { id: rawId },
    });
  }

  public async findByOrgId(
    orgId: string,
    filter?: AssessmentFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Assessment[]> {
    const where: any = { orgId };

    if (filter?.lessonId) {
      where.lessonId = filter.lessonId;
    }
    if (filter?.boardId) {
      where.boardId = filter.boardId;
    }
    if (filter?.studentId) {
      where.studentId = filter.studentId;
    }
    if (filter?.status) {
      where.status = filter.status;
    }

    const records = await this.prisma.assessment.findMany({
      where,
      include: { markingItems: true },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByLessonAndStudent(
    lessonId: string,
    studentId: string,
  ): Promise<Assessment | null> {
    const record = await this.prisma.assessment.findFirst({
      where: { lessonId, studentId },
      include: { markingItems: true },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findByStudentId(
    studentId: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<Assessment[]> {
    const records = await this.prisma.assessment.findMany({
      where: { studentId },
      include: { markingItems: true },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }
}
