import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PauseClassroomCommand } from './pause-classroom.command';
import { ClassroomNotFoundError, IClassroomRepository } from '../../../domain';

@CommandHandler(PauseClassroomCommand)
export class PauseClassroomHandler
  implements ICommandHandler<PauseClassroomCommand, { success: boolean }>
{
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(command: PauseClassroomCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const classroom = await this.classroomRepository.findById(payload.classroomId);
    if (!classroom || classroom.orgId !== payload.orgId) {
      throw new ClassroomNotFoundError();
    }

    classroom.pause(payload.correlationId);
    await this.classroomRepository.save(classroom);

    return { success: true };
  }
}
