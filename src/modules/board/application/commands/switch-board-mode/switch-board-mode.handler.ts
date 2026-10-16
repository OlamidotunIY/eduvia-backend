import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SwitchBoardModeCommand } from './switch-board-mode.command';
import { SwitchBoardModeResult } from './switch-board-mode.result';
import { ILearningBoardRepository, LearningBoardNotFoundError } from '../../../domain';

@CommandHandler(SwitchBoardModeCommand)
export class SwitchBoardModeHandler
  implements ICommandHandler<SwitchBoardModeCommand, SwitchBoardModeResult>
{
  constructor(private readonly boardRepository: ILearningBoardRepository) {}

  async execute(command: SwitchBoardModeCommand): Promise<SwitchBoardModeResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.switchMode(payload.mode, payload.changedBy, correlationId, payload.lessonStatus);
    await this.boardRepository.save(board);

    return {
      id: board.id.unpack(),
      mode: board.mode,
    };
  }
}
