import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelLessonCommand } from './cancel-lesson.command';
import { ILessonRepository, LessonNotFoundError } from '../../../domain';

@CommandHandler(CancelLessonCommand)
export class CancelLessonHandler
  implements ICommandHandler<CancelLessonCommand, { success: boolean }>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(command: CancelLessonCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const lesson = await this.lessonRepository.findById(payload.lessonId);
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new LessonNotFoundError();
    }

    lesson.cancel(payload.reason, payload.cancelledBy, payload.correlationId);
    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
