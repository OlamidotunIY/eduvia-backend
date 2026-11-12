import { randomUUID } from 'crypto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { CreateClassroomCommand } from './create-classroom.command';
import { CreateClassroomResult } from './create-classroom.result';
import {
  Classroom,
  IClassroomRepository,
  RecurrencePattern,
} from '../../../domain';
import { ClassroomLessonMaterializer } from '../../services/classroom-lesson-materializer.service';

@CommandHandler(CreateClassroomCommand)
export class CreateClassroomHandler implements ICommandHandler<
  CreateClassroomCommand,
  CreateClassroomResult
> {
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly materializer: ClassroomLessonMaterializer,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: CreateClassroomCommand,
  ): Promise<CreateClassroomResult> {
    const { payload } = command;

    const recurrence = RecurrencePattern.create({
      daysOfWeek: payload.recurrenceDaysOfWeek,
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

    // Auto-create classroom chatroom with primary teacher as initial participant
    try {
      const existingConv = await this.prisma.conversation.findFirst({
        where: { classroomId: classroom.id.value },
      });
      if (!existingConv) {
        await this.prisma.conversation.create({
          data: {
            id: randomUUID(),
            orgId: payload.orgId,
            type: 'classroom_group' as any,
            classroomId: classroom.id.value,
            subject: payload.name,
            participants: [payload.primaryTeacherId],
            status: 'active',
          },
        });
      }
    } catch {
      // Ensure chatroom provisioning does not block classroom creation
    }

    // Materialize eight-week horizon of occurrences synchronously on creation
    await this.materializer.materializeClassroom(classroom, {
      horizonWeeks: 8,
    });

    return {
      id: classroom.id.value,
    };
  }
}
