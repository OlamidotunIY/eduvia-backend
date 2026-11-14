import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBoardSectionCommand } from './update-board-section.command';
import { UpdateBoardSectionResult } from './update-board-section.result';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  LearningBoardNotFoundError,
  BoardSectionNotFoundError,
  BoardLockedError,
} from '../../../domain';

@CommandHandler(UpdateBoardSectionCommand)
export class UpdateBoardSectionHandler
  implements ICommandHandler<UpdateBoardSectionCommand, UpdateBoardSectionResult>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly sectionRepository: IBoardSectionRepository,
  ) {}

  async execute(command: UpdateBoardSectionCommand): Promise<UpdateBoardSectionResult> {
    const { payload } = command;

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }
    if (board.isLocked) {
      throw new BoardLockedError();
    }

    const section = await this.sectionRepository.findById(payload.sectionId);
    if (!section || section.boardId !== payload.boardId) {
      throw new BoardSectionNotFoundError({ sectionId: payload.sectionId });
    }

    section.updateContent(payload.content);

    await this.sectionRepository.save(section);
    await this.boardRepository.save(board);

    return {
      id: section.id.unpack(),
      boardId: board.id.unpack(),
      content: section.content,
    };
  }
}
