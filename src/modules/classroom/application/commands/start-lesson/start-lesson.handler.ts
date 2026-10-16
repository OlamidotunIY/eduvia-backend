import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartLessonCommand } from './start-lesson.command';
import { ILessonRepository, LessonNotFoundError } from '../../../domain';

@CommandHandler(StartLessonCommand)
export class StartLessonHandler
  implements ICommandHandler<StartLessonCommand, { success: boolean; meetLink: string | null }>
{
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(
    command: StartLessonCommand,
  ): Promise<{ success: boolean; meetLink: string | null }> {
    const { payload } = command;
    const lesson = await this.lessonRepository.findById(payload.lessonId);
    if (!lesson || lesson.orgId !== payload.orgId) {
      throw new LessonNotFoundError();
    }

    lesson.start(payload.correlationId);
    await this.lessonRepository.save(lesson);

    return {
      success: true,
      meetLink: lesson.meetLink,
    };
  }
}
