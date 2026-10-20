import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LockBoardCommand } from './lock-board.command';
import { LockBoardResult } from './lock-board.result';
import { ILearningBoardRepository, LearningBoardNotFoundError } from '../../../domain';

@CommandHandler(LockBoardCommand)
export class LockBoardHandler
  implements ICommandHandler<LockBoardCommand, LockBoardResult>
{
  constructor(private readonly boardRepository: ILearningBoardRepository) {}

  async execute(command: LockBoardCommand): Promise<LockBoardResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.lock(payload.lockedBy, correlationId);
    await this.boardRepository.save(board);

    return {
      id: board.id.unpack(),
      isLocked: board.isLocked,
    };
  }
}
