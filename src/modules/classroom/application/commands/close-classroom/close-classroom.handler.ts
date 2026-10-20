import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseClassroomCommand } from './close-classroom.command';
import { ClassroomNotFoundError, IClassroomRepository } from '../../../domain';

@CommandHandler(CloseClassroomCommand)
export class CloseClassroomHandler
  implements ICommandHandler<CloseClassroomCommand, { success: boolean }>
{
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(command: CloseClassroomCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const classroom = await this.classroomRepository.findById(payload.classroomId);
    if (!classroom || classroom.orgId !== payload.orgId) {
      throw new ClassroomNotFoundError();
    }

    classroom.close(payload.correlationId);
    await this.classroomRepository.save(classroom);

    return { success: true };
  }
}
