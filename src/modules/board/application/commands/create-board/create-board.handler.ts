import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from './create-board.command';
import { CreateBoardResult } from './create-board.result';
import { LearningBoard, ILearningBoardRepository } from '../../../domain';

@CommandHandler(CreateBoardCommand)
export class CreateBoardHandler
  implements ICommandHandler<CreateBoardCommand, CreateBoardResult>
{
  constructor(private readonly boardRepository: ILearningBoardRepository) {}

  async execute(command: CreateBoardCommand): Promise<CreateBoardResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const existing = await this.boardRepository.findByLessonId(payload.lessonId);
    if (existing) {
      return { id: existing.id.unpack() };
    }

    const board = LearningBoard.create(
      {
        lessonId: payload.lessonId,
        orgId: payload.orgId,
        plan: payload.plan,
      },
      correlationId,
    );

    await this.boardRepository.save(board);

    return {
      id: board.id.unpack(),
    };
  }
}
