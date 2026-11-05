import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RescheduleLessonCommand } from './reschedule-lesson.command';
import {
  ILessonRepository,
  ITeacherAvailabilityRepository,
  LessonNotFoundError,
  ScheduleConflictError,
  TeacherUnavailableError,
} from '../../../domain';

@CommandHandler(RescheduleLessonCommand)
export class RescheduleLessonHandler
  implements ICommandHandler<RescheduleLessonCommand, { success: boolean }>
{
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly availabilityRepository: ITeacherAvailabilityRepository,
  ) {}

  async execute(
    command: RescheduleLessonCommand,
  ): Promise<{ success: boolean }> {
    const { payload } = command;

    const lesson = await this.lessonRepository.findById(payload.lessonId);
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new LessonNotFoundError();
    }

    const durationMins = payload.durationMins ?? lesson.durationMins;
    const activeTeacher = lesson.coverTeacherId ?? lesson.teacherId;

    const availability = await this.availabilityRepository.findByTeacherId(
      payload.orgId,
      activeTeacher,
    );
    if (
      availability &&
      !availability.isAvailableAt(payload.scheduledAt, durationMins)
    ) {
      throw new TeacherUnavailableError();
    }

    const conflicts = await this.lessonRepository.findConflictingLessons(
      payload.orgId,
      activeTeacher,
      payload.scheduledAt,
      durationMins,
      lesson.id.value,
    );
    if (conflicts.length > 0) {
      throw new ScheduleConflictError();
    }

    lesson.reschedule({
      scheduledAt: payload.scheduledAt,
      durationMins: payload.durationMins,
      correlationId: payload.correlationId,
    });

    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
