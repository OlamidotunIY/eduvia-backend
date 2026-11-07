import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Assessment,
  AssessmentId,
  IAssessmentRepository,
  AssessmentFilter,
  AssessmentStatus,
  AssessmentSummary,
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
    const where = this.toWhere(orgId, filter);

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

  public async countByOrgId(
    orgId: string,
    filter?: AssessmentFilter,
  ): Promise<number> {
    return this.prisma.assessment.count({
      where: this.toWhere(orgId, filter),
    });
  }

  public async getSummaryByOrgId(
    orgId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentSummary> {
    const where = this.toWhere(orgId, filter);
    const [total, pendingMarking, partiallyMarked, fullyMarked, scores] =
      await Promise.all([
        this.prisma.assessment.count({ where }),
        this.prisma.assessment.count({
          where: { ...where, status: AssessmentStatus.pending_marking },
        }),
        this.prisma.assessment.count({
          where: { ...where, status: AssessmentStatus.partially_marked },
        }),
        this.prisma.assessment.count({
          where: { ...where, status: AssessmentStatus.fully_marked },
        }),
        this.prisma.assessment.aggregate({
          where: { ...where, status: AssessmentStatus.fully_marked },
          _avg: { scorePercent: true },
        }),
      ]);

    return {
      total,
      pendingMarking,
      partiallyMarked,
      fullyMarked,
      averageScorePercent: scores._avg.scorePercent,
    };
  }

  private toWhere(orgId: string, filter?: AssessmentFilter): any {
    const where: any = { orgId };
    if (filter?.lessonId) where.lessonId = filter.lessonId;
    if (filter?.boardId) where.boardId = filter.boardId;
    if (filter?.studentId) where.studentId = filter.studentId;
    if (filter?.status) where.status = filter.status;
    if (filter?.createdFrom || filter?.createdTo) {
      where.createdAt = {
        ...(filter.createdFrom ? { gte: filter.createdFrom } : {}),
        ...(filter.createdTo ? { lte: filter.createdTo } : {}),
      };
    }
    return where;
  }
}
