import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleLessonCommand } from './schedule-lesson.command';
import {
  ClassroomNotFoundError,
  IClassroomRepository,
  ILessonRepository,
  ITeacherAvailabilityRepository,
  Lesson,
  ScheduleConflictError,
  TeacherUnavailableError,
} from '../../../domain';

@CommandHandler(ScheduleLessonCommand)
export class ScheduleLessonHandler
  implements ICommandHandler<ScheduleLessonCommand, { id: string }>
{
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly lessonRepository: ILessonRepository,
    private readonly availabilityRepository: ITeacherAvailabilityRepository,
  ) {}

  async execute(command: ScheduleLessonCommand): Promise<{ id: string }> {
    const { payload } = command;
    const classroom = await this.classroomRepository.findById(payload.classroomId);
    if (!classroom || classroom.orgId !== payload.orgId) {
      throw new ClassroomNotFoundError();
    }

    const teacherId = payload.teacherId ?? classroom.primaryTeacherId;
    const durationMins = payload.durationMins ?? classroom.lessonDurationMins;

    const availability = await this.availabilityRepository.findByTeacherId(
      payload.orgId,
      teacherId,
    );
    if (availability && !availability.isAvailableAt(payload.scheduledAt, durationMins)) {
      throw new TeacherUnavailableError();
    }

    const conflicts = await this.lessonRepository.findConflictingLessons(
      payload.orgId,
      teacherId,
      payload.scheduledAt,
      durationMins,
    );
    if (conflicts.length > 0) {
      throw new ScheduleConflictError();
    }

    const lesson = Lesson.create({
      orgId: payload.orgId,
      classroomId: payload.classroomId,
      teacherId,
      scheduledAt: payload.scheduledAt,
      durationMins,
      isRecurring: payload.isRecurring ?? true,
      correlationId: payload.correlationId,
    });

    lesson.schedule(undefined, payload.correlationId);

    await this.lessonRepository.save(lesson);

    return { id: lesson.id.value };
  }
}
