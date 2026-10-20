import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLessonByIdQuery } from './get-lesson-by-id.query';
import { LessonDto } from './get-lesson-by-id.dto';
import { ILessonRepository, LessonNotFoundError } from '../../../domain';

@QueryHandler(GetLessonByIdQuery)
export class GetLessonByIdHandler
  implements IQueryHandler<GetLessonByIdQuery, LessonDto>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(query: GetLessonByIdQuery): Promise<LessonDto> {
    const lesson = await this.lessonRepository.findById(query.lessonId);
    if (!lesson || lesson.orgId !== query.orgId) {
      throw new LessonNotFoundError();
    }

    return {
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
    };
  }
}
