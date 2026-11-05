import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ClassroomNotFoundError,
  IClassroomRepository,
  ILessonRepository,
} from '../../../domain';
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
    const classroom = await this.classroomRepository.findById(query.classroomId);
    if (!classroom || classroom.orgId !== query.orgId) {
      throw new ClassroomNotFoundError();
    }

    const lessons = await this.lessonRepository.findByClassroomId(
      query.orgId,
      query.classroomId,
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
