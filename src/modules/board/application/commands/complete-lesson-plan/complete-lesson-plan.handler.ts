import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteLessonPlanCommand } from './complete-lesson-plan.command';
import { CompleteLessonPlanResult } from './complete-lesson-plan.result';
import { ILearningBoardRepository, LearningBoardNotFoundError } from '../../../domain';

@CommandHandler(CompleteLessonPlanCommand)
export class CompleteLessonPlanHandler
  implements ICommandHandler<CompleteLessonPlanCommand, CompleteLessonPlanResult>
{
  constructor(private readonly boardRepository: ILearningBoardRepository) {}

  async execute(command: CompleteLessonPlanCommand): Promise<CompleteLessonPlanResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.completePlan(correlationId);
    await this.boardRepository.save(board);

    return {
      id: board.id.unpack(),
      isComplete: board.plan.isComplete,
      completedAt: board.plan.completedAt ?? null,
    };
  }
}
