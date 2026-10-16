import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClassroomCommand } from './create-classroom.command';
import { CreateClassroomResult } from './create-classroom.result';
import {
  Classroom,
  IClassroomRepository,
  RecurrencePattern,
} from '../../../domain';

@CommandHandler(CreateClassroomCommand)
export class CreateClassroomHandler
  implements ICommandHandler<CreateClassroomCommand, CreateClassroomResult>
{
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(command: CreateClassroomCommand): Promise<CreateClassroomResult> {
    const { payload } = command;

    const recurrence = RecurrencePattern.create({
      dayOfWeek: payload.recurrenceDayOfWeek,
      startTime: payload.recurrenceStartTime,
      timezone: payload.recurrenceTimezone,
      intervalWeeks: payload.recurrenceIntervalWeeks ?? 1,
      effectiveFrom: payload.recurrenceEffectiveFrom,
      effectiveUntil: payload.recurrenceEffectiveUntil,
    });

    const classroom = Classroom.create({
      orgId: payload.orgId,
      name: payload.name,
      subjectId: payload.subjectId,
      primaryTeacherId: payload.primaryTeacherId,
      lessonDurationMins: payload.lessonDurationMins,
      maxStudents: payload.maxStudents ?? 1,
      recurrence,
      correlationId: payload.correlationId,
    });

    await this.classroomRepository.save(classroom);

    return {
      id: classroom.id.value,
    };
  }
}
