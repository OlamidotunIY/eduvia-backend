import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClassroomNotFoundError, IClassroomRepository } from '../../../domain';
import { ReopenClassroomCommand } from './reopen-classroom.command';

@CommandHandler(ReopenClassroomCommand)
export class ReopenClassroomHandler
  implements ICommandHandler<ReopenClassroomCommand, { success: boolean }>
{
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(command: ReopenClassroomCommand): Promise<{ success: boolean }> {
    const classroom = await this.classroomRepository.findById(
      command.payload.classroomId,
    );
    if (!classroom || classroom.orgId !== command.payload.orgId) {
      throw new ClassroomNotFoundError();
    }

    classroom.reopen();
    await this.classroomRepository.save(classroom);
    return { success: true };
  }
}
