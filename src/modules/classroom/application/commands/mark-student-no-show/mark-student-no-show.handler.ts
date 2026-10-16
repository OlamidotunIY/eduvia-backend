import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkStudentNoShowCommand } from './mark-student-no-show.command';
import { ILessonRepository, LessonNotFoundError } from '../../../domain';

@CommandHandler(MarkStudentNoShowCommand)
export class MarkStudentNoShowHandler
  implements ICommandHandler<MarkStudentNoShowCommand, { success: boolean }>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(command: MarkStudentNoShowCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const lesson = await this.lessonRepository.findById(payload.lessonId);
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new LessonNotFoundError();
    }

    lesson.markStudentNoShow(payload.correlationId);
    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
