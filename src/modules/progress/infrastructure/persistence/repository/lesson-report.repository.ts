import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  LessonReport,
  LessonReportId,
  ILessonReportRepository,
  LessonReportFilter,
  ReportStatus,
} from '../../../domain';
import { LessonReport as PrismaLessonReport } from '@generated/prisma/client';
import { LessonReportMapper } from '../mappers/lesson-report.mapper';
import { ReportCommentMapper } from '../mappers/report-comment.mapper';

@Injectable()
export class PrismaLessonReportRepository
  extends PrismaBaseRepository<LessonReportId, LessonReport, PrismaLessonReport>
  implements ILessonReportRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly lessonReportMapper: LessonReportMapper,
    protected readonly commentMapper: ReportCommentMapper,
  ) {
    super(prisma, lessonReportMapper);
  }

  protected get delegate() {
    return this.prisma.lessonReport;
  }

  public override async findById(id: LessonReportId | string): Promise<LessonReport | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.lessonReport.findUnique({
      where: { id: rawId },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    return record ? this.lessonReportMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<LessonReport[]> {
    const records = await this.prisma.lessonReport.findMany({
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.lessonReportMapper.toDomain(record));
  }

  public override async save(entity: LessonReport): Promise<void> {
    const data = this.lessonReportMapper.toPersistence(entity);
    const reportId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    const outboxWrites = events.map((event) =>
      this.prisma.outboxMessage.create({
        data: {
          id: typeof event.eventId === 'string' ? event.eventId : String(event.eventId),
          eventId: event.eventId,
          type: event.eventName,
          aggregateType: entity.constructor.name,
          aggregateId: entity.getId(),
          payload: event.payload as object,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
          status: 'PENDING' as any,
        },
      }),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.lessonReport.upsert({
        where: { id: reportId },
        create: {
          id: reportId,
          ...data,
        },
        update: data,
      });

      for (const comment of entity.comments) {
        const commentData = this.commentMapper.toPersistence(comment);
        const commentId = comment.id.unpack();
        await tx.reportComment.upsert({
          where: { id: commentId },
          create: {
            id: commentId,
            ...commentData,
          },
          update: commentData,
        });
      }

      for (const write of outboxWrites) {
        await write;
      }
    });
  }

  public async findByLessonId(lessonId: string): Promise<LessonReport | null> {
    const record = await this.prisma.lessonReport.findUnique({
      where: { lessonId },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    return record ? this.lessonReportMapper.toDomain(record) : null;
  }

  public async findByOrgId(
    orgId: string,
    filter?: LessonReportFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReport[]> {
    const where: any = { orgId };

    if (filter?.classroomId) {
      where.classroomId = filter.classroomId;
    }
    if (filter?.teacherId) {
      where.teacherId = filter.teacherId;
    }
    if (filter?.studentId) {
      where.studentId = filter.studentId;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.parentCanView !== undefined) {
      where.parentCanView = filter.parentCanView;
    }

    const records = await this.prisma.lessonReport.findMany({
      where,
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.lessonReportMapper.toDomain(record));
  }

  public async findByStudentId(
    studentId: string,
    orgId?: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReport[]> {
    const where: any = { studentId };
    if (orgId) {
      where.orgId = orgId;
    }

    const records = await this.prisma.lessonReport.findMany({
      where,
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.lessonReportMapper.toDomain(record));
  }

  public async findSubmittedByStudent(
    studentId: string,
    orgId?: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReport[]> {
    const where: any = {
      studentId,
      status: ReportStatus.submitted,
      parentCanView: true,
    };
    if (orgId) {
      where.orgId = orgId;
    }

    const records = await this.prisma.lessonReport.findMany({
      where,
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { submittedAt: 'desc' },
    });

    return records.map((record) => this.lessonReportMapper.toDomain(record));
  }

  public async findArchivableReports(cutoffDate: Date): Promise<LessonReport[]> {
    const records = await this.prisma.lessonReport.findMany({
      where: {
        status: ReportStatus.submitted,
        submittedAt: { lte: cutoffDate },
      },
      include: { comments: true },
    });

    return records.map((record) => this.lessonReportMapper.toDomain(record));
  }
}
