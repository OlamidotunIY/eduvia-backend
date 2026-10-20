import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  ILessonRepository,
  Lesson,
  LessonFilters,
  LessonId,
  LessonStatus,
} from '../../../domain';
import { Lesson as PrismaLesson } from '@generated/prisma/client';
import { LessonMapper } from '../mappers/lesson.mapper';

@Injectable()
export class PrismaLessonRepository
  extends PrismaBaseRepository<LessonId, Lesson, PrismaLesson>
  implements ILessonRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly lessonMapper: LessonMapper,
  ) {
    super(prisma, lessonMapper);
  }

  protected get delegate() {
    return this.prisma.lesson;
  }

  public async findByClassroomId(
    orgId: string,
    classroomId: string,
  ): Promise<Lesson[]> {
    const records = await this.delegate.findMany({
      where: { orgId, classroomId },
      orderBy: { scheduledAt: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByOrgId(
    orgId: string,
    filters?: LessonFilters,
  ): Promise<Lesson[]> {
    const where: any = { orgId };
    if (filters?.status) where.status = filters.status;
    if (filters?.teacherId) where.teacherId = filters.teacherId;
    if (filters?.fromDate || filters?.toDate) {
      where.scheduledAt = {};
      if (filters.fromDate) where.scheduledAt.gte = filters.fromDate;
      if (filters.toDate) where.scheduledAt.lte = filters.toDate;
    }

    const records = await this.delegate.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findConflictingLessons(
    orgId: string,
    teacherId: string,
    scheduledAt: Date,
    durationMins: number,
    excludeLessonId?: string,
  ): Promise<Lesson[]> {
    const lessonEnd = new Date(scheduledAt.getTime() + durationMins * 60000);
    const records = await this.delegate.findMany({
      where: {
        orgId,
        teacherId,
        status: {
          notIn: [
            LessonStatus.CANCELLED,
            LessonStatus.STUDENT_NO_SHOW,
            LessonStatus.TEACHER_NO_SHOW,
            LessonStatus.ARCHIVED,
          ],
        },
        id: excludeLessonId ? { not: excludeLessonId } : undefined,
      },
    });

    return records
      .map((r) => this.mapper.toDomain(r))
      .filter((lesson) => {
        const curStart = lesson.scheduledAt;
        const curEnd = new Date(
          curStart.getTime() + lesson.durationMins * 60000,
        );
        return scheduledAt < curEnd && lessonEnd > curStart;
      });
  }

  public async findReportedOlderThan(date: Date): Promise<Lesson[]> {
    const records = await this.delegate.findMany({
      where: {
        status: LessonStatus.REPORTED,
        reportedAt: { lte: date },
      },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }
}
