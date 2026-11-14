import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ILearningBoardRepository,
  LearningBoardNotFoundError,
} from '../../../domain';
import { SaveCanvasStateCommand } from './save-canvas-state.command';
import { SaveCanvasStateResult } from './save-canvas-state.result';

@CommandHandler(SaveCanvasStateCommand)
export class SaveCanvasStateHandler
  implements ICommandHandler<SaveCanvasStateCommand, SaveCanvasStateResult>
{
  constructor(private readonly boardRepository: ILearningBoardRepository) {}

  async execute(command: SaveCanvasStateCommand): Promise<SaveCanvasStateResult> {
    const { payload } = command;

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.updateCanvasState(payload.canvasState);
    await this.boardRepository.save(board);

    return {
      id: board.id.unpack(),
      canvasState: board.canvasState,
    };
  }
}
