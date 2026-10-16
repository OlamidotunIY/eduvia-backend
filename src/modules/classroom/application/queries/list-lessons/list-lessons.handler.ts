import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListLessonsQuery } from './list-lessons.query';
import { LessonDto } from '../get-lesson-by-id/get-lesson-by-id.dto';
import { ILessonRepository } from '../../../domain';

@QueryHandler(ListLessonsQuery)
export class ListLessonsHandler
  implements IQueryHandler<ListLessonsQuery, LessonDto[]>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(query: ListLessonsQuery): Promise<LessonDto[]> {
    const lessons = await this.lessonRepository.findByOrgId(
      query.orgId,
      query.filters,
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
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));
  }
}
