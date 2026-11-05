import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BadRequestError } from '@modules/shared';
import {
  ClassroomNotFoundError,
  IClassroomRepository,
  ILessonRepository,
} from '../../../domain';
import { getCurrentLocalWeekRange } from '../../../domain/services/classroom-scheduler.util';
import { LessonDto } from '../get-lesson-by-id/get-lesson-by-id.dto';
import { ListClassroomLessonsQuery } from './list-classroom-lessons.query';

@QueryHandler(ListClassroomLessonsQuery)
export class ListClassroomLessonsHandler
  implements IQueryHandler<ListClassroomLessonsQuery, LessonDto[]>
{
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(query: ListClassroomLessonsQuery): Promise<LessonDto[]> {
    const classroom = await this.classroomRepository.findById(
      query.classroomId,
    );
    if (!classroom || classroom.orgId !== query.orgId) {
      throw new ClassroomNotFoundError();
    }

    let fromDate: Date;
    let toDate: Date;

    const maxHorizonDurationMs = 56 * 24 * 60 * 60 * 1000 + 86400000; // 8 weeks + 1 day buffer
    const maxHorizonDate = new Date(Date.now() + maxHorizonDurationMs);

    if (query.fromDate && query.toDate) {
      fromDate = query.fromDate;
      toDate = query.toDate;

      if (fromDate > toDate) {
        throw new BadRequestError('fromDate must be on or before toDate');
      }

      const requestedDurationMs = toDate.getTime() - fromDate.getTime();
      if (requestedDurationMs > maxHorizonDurationMs) {
        throw new BadRequestError(
          'Requested date range cannot exceed eight weeks',
        );
      }

      if (toDate.getTime() > maxHorizonDate.getTime()) {
        throw new BadRequestError(
          'Requested date range cannot extend beyond the eight-week materialization horizon',
        );
      }
    } else if (query.fromDate && !query.toDate) {
      fromDate = query.fromDate;
      toDate = new Date(fromDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (toDate.getTime() > maxHorizonDate.getTime()) {
        toDate = maxHorizonDate;
      }
    } else {
      // Default to the current local week in the classroom's timezone
      const weekRange = getCurrentLocalWeekRange(
        classroom.recurrence.timezone,
      );
      fromDate = weekRange.fromDate;
      toDate = weekRange.toDate;
    }

    const lessons = await this.lessonRepository.findByClassroomId(
      query.orgId,
      query.classroomId,
      { fromDate, toDate },
    );

    return lessons.map((lesson) => ({
      id: lesson.id.value,
      orgId: lesson.orgId,
      classroomId: lesson.classroomId,
      teacherId: lesson.teacherId,
      coverTeacherId: lesson.coverTeacherId,
      scheduledAt: lesson.scheduledAt,
      durationMins: lesson.durationMins,
      status: lesson.status,
      meetingId: lesson.meetingId,
      videoProvider: lesson.videoProvider,
      meetLink: lesson.meetLink,
      cancelledReason: lesson.cancelledReason,
      cancelledBy: lesson.cancelledBy,
      noShowAt: lesson.noShowAt,
      noShowType: lesson.noShowType,
      startedAt: lesson.startedAt,
      completedAt: lesson.completedAt,
      markedAt: lesson.markedAt,
      reportedAt: lesson.reportedAt,
      archivedAt: lesson.archivedAt,
      isRecurring: lesson.isRecurring,
      origin: lesson.origin,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));
  }
}
