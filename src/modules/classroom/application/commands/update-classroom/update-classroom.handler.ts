import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClassroomCommand } from './update-classroom.command';
import {
  ClassroomInvariantError,
  ClassroomNotFoundError,
  IClassroomRepository,
  RecurrencePattern,
} from '../../../domain';
import { ClassroomLessonMaterializer } from '../../services/classroom-lesson-materializer.service';

@CommandHandler(UpdateClassroomCommand)
export class UpdateClassroomHandler implements ICommandHandler<
  UpdateClassroomCommand,
  { success: boolean }
> {
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly materializer: ClassroomLessonMaterializer,
  ) {}

  async execute(
    command: UpdateClassroomCommand,
  ): Promise<{ success: boolean }> {
    const { payload } = command;
    const classroom = await this.classroomRepository.findById(
      payload.classroomId,
    );
    if (!classroom || classroom.orgId !== payload.orgId) {
      throw new ClassroomNotFoundError();
    }

    if (
      payload.primaryTeacherId &&
      payload.primaryTeacherId !== classroom.primaryTeacherId
    ) {
      classroom.changeTeacher(payload.primaryTeacherId, payload.correlationId);
    }

    classroom.update({
      name: payload.name,
      lessonDurationMins: payload.lessonDurationMins,
      maxStudents: payload.maxStudents,
    });

    const hasRecurrenceUpdate = [
      payload.recurrenceDaysOfWeek,
      payload.recurrenceStartTime,
      payload.recurrenceTimezone,
      payload.recurrenceIntervalWeeks,
      payload.recurrenceEffectiveFrom,
      payload.recurrenceEffectiveUntil,
    ].some((value) => value !== undefined);

    if (hasRecurrenceUpdate) {
      if (
        payload.recurrenceDaysOfWeek === undefined ||
        payload.recurrenceStartTime === undefined ||
        payload.recurrenceTimezone === undefined ||
        payload.recurrenceIntervalWeeks === undefined ||
        payload.recurrenceEffectiveFrom === undefined
      ) {
        throw new ClassroomInvariantError(
          'A recurrence update requires a complete recurrence pattern',
        );
      }
      classroom.updateRecurrence(
        RecurrencePattern.create({
          daysOfWeek: payload.recurrenceDaysOfWeek,
          startTime: payload.recurrenceStartTime,
          timezone: payload.recurrenceTimezone,
          intervalWeeks: payload.recurrenceIntervalWeeks,
          effectiveFrom: payload.recurrenceEffectiveFrom,
          effectiveUntil: payload.recurrenceEffectiveUntil,
        }),
        payload.correlationId,
      );
    }

    await this.classroomRepository.save(classroom);

    // Reconcile future occurrences if recurrence pattern changed
    if (hasRecurrenceUpdate) {
      await this.materializer.reconcileClassroomRecurrence(classroom, {
        horizonWeeks: 8,
      });
    }

    return { success: true };
  }
}
