import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Lesson,
  LessonId,
  LessonStatus,
  VideoProvider,
  NoShowType,
} from '../../../domain';
import { Lesson as PrismaLesson } from '@generated/prisma/client';

@Injectable()
export class LessonMapper implements IMapper<Lesson, PrismaLesson> {
  toDomain(record: PrismaLesson): Lesson {
    return Lesson.reconstitute({
      id: LessonId.from(record.id),
      orgId: record.orgId,
      classroomId: record.classroomId,
      teacherId: record.teacherId,
      coverTeacherId: record.coverTeacherId,
      scheduledAt: record.scheduledAt,
      durationMins: record.durationMins,
      status: record.status as LessonStatus,
      meetingId: record.meetingId,
      videoProvider: record.videoProvider as VideoProvider | null,
      meetLink: record.meetLink,
      cancelledReason: record.cancelledReason,
      cancelledBy: record.cancelledBy,
      noShowAt: record.noShowAt,
      noShowType: record.noShowType as NoShowType | null,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      markedAt: record.markedAt,
      reportedAt: record.reportedAt,
      archivedAt: record.archivedAt,
      isRecurring: record.isRecurring,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Lesson): Omit<PrismaLesson, 'id'> {
    return {
      orgId: entity.orgId,
      classroomId: entity.classroomId,
      teacherId: entity.teacherId,
      coverTeacherId: entity.coverTeacherId,
      scheduledAt: entity.scheduledAt,
      durationMins: entity.durationMins,
      status: entity.status,
      meetingId: entity.meetingId,
      videoProvider: entity.videoProvider,
      meetLink: entity.meetLink,
      cancelledReason: entity.cancelledReason,
      cancelledBy: entity.cancelledBy,
      noShowAt: entity.noShowAt,
      noShowType: entity.noShowType,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
      markedAt: entity.markedAt,
      reportedAt: entity.reportedAt,
      archivedAt: entity.archivedAt,
      isRecurring: entity.isRecurring,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
