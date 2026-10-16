import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteLessonCommand } from './complete-lesson.command';
import { ILessonRepository, LessonNotFoundError } from '../../../domain';

@CommandHandler(CompleteLessonCommand)
export class CompleteLessonHandler
  implements ICommandHandler<CompleteLessonCommand, { success: boolean }>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(command: CompleteLessonCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const lesson = await this.lessonRepository.findById(payload.lessonId);
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new LessonNotFoundError();
    }

    lesson.complete(payload.correlationId);
    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
