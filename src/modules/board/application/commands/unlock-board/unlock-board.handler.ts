import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnlockBoardCommand } from './unlock-board.command';
import { UnlockBoardResult } from './unlock-board.result';
import { ILearningBoardRepository, LearningBoardNotFoundError } from '../../../domain';

@CommandHandler(UnlockBoardCommand)
export class UnlockBoardHandler
  implements ICommandHandler<UnlockBoardCommand, UnlockBoardResult>
{
  constructor(private readonly boardRepository: ILearningBoardRepository) {}

  async execute(command: UnlockBoardCommand): Promise<UnlockBoardResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.unlock(payload.unlockedBy, correlationId);
    await this.boardRepository.save(board);

    return {
      id: board.id.unpack(),
      isLocked: board.isLocked,
    };
  }
}
