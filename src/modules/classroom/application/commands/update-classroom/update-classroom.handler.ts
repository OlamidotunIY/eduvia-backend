import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClassroomCommand } from './update-classroom.command';
import { ClassroomNotFoundError, IClassroomRepository } from '../../../domain';

@CommandHandler(UpdateClassroomCommand)
export class UpdateClassroomHandler
  implements ICommandHandler<UpdateClassroomCommand, { success: boolean }>
{
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(command: UpdateClassroomCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const classroom = await this.classroomRepository.findById(payload.classroomId);
    if (!classroom || classroom.orgId !== payload.orgId) {
      throw new ClassroomNotFoundError();
    }

    if (payload.primaryTeacherId && payload.primaryTeacherId !== classroom.primaryTeacherId) {
      classroom.changeTeacher(payload.primaryTeacherId, payload.correlationId);
    }

    classroom.update({
      name: payload.name,
      lessonDurationMins: payload.lessonDurationMins,
      maxStudents: payload.maxStudents,
    });

    await this.classroomRepository.save(classroom);

    return { success: true };
  }
}
