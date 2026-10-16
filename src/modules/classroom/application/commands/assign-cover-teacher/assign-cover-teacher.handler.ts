import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignCoverTeacherCommand } from './assign-cover-teacher.command';
import { ILessonRepository, LessonNotFoundError } from '../../../domain';

@CommandHandler(AssignCoverTeacherCommand)
export class AssignCoverTeacherHandler
  implements ICommandHandler<AssignCoverTeacherCommand, { success: boolean }>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(command: AssignCoverTeacherCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const lesson = await this.lessonRepository.findById(payload.lessonId);
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new LessonNotFoundError();
    }

    lesson.assignCoverTeacher(payload.coverTeacherId, payload.correlationId);
    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
