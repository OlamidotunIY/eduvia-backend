import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkTeacherNoShowCommand } from './mark-teacher-no-show.command';
import { ILessonRepository, LessonNotFoundError } from '../../../domain';

@CommandHandler(MarkTeacherNoShowCommand)
export class MarkTeacherNoShowHandler
  implements ICommandHandler<MarkTeacherNoShowCommand, { success: boolean }>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(command: MarkTeacherNoShowCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const lesson = await this.lessonRepository.findById(payload.lessonId);
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new LessonNotFoundError();
    }

    lesson.markTeacherNoShow(payload.markedBy, payload.correlationId);
    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
