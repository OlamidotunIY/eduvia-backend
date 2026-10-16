import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveLessonPlanCommand } from './save-lesson-plan.command';
import { SaveLessonPlanResult } from './save-lesson-plan.result';
import { ILearningBoardRepository, LearningBoardNotFoundError } from '../../../domain';

@CommandHandler(SaveLessonPlanCommand)
export class SaveLessonPlanHandler
  implements ICommandHandler<SaveLessonPlanCommand, SaveLessonPlanResult>
{
  constructor(private readonly boardRepository: ILearningBoardRepository) {}

  async execute(command: SaveLessonPlanCommand): Promise<SaveLessonPlanResult> {
    const { payload } = command;

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.updatePlan({
      learningObjectives: payload.learningObjectives,
      topicsCovered: payload.topicsCovered,
      teachingNotes: payload.teachingNotes,
      homeworkDescription: payload.homeworkDescription,
    });

    await this.boardRepository.save(board);

    return {
      id: board.id.unpack(),
      plan: board.plan.toJSON(),
    };
  }
}
