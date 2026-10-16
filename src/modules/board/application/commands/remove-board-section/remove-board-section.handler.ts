import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveBoardSectionCommand } from './remove-board-section.command';
import { RemoveBoardSectionResult } from './remove-board-section.result';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  LearningBoardNotFoundError,
} from '../../../domain';

@CommandHandler(RemoveBoardSectionCommand)
export class RemoveBoardSectionHandler
  implements ICommandHandler<RemoveBoardSectionCommand, RemoveBoardSectionResult>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly sectionRepository: IBoardSectionRepository,
  ) {}

  async execute(command: RemoveBoardSectionCommand): Promise<RemoveBoardSectionResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.removeSection(payload.sectionId, correlationId);
    await this.sectionRepository.delete(payload.sectionId);
    await this.boardRepository.save(board);

    return {
      id: payload.sectionId,
      boardId: board.id.unpack(),
    };
  }
}
