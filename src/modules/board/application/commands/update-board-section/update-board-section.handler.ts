import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBoardSectionCommand } from './update-board-section.command';
import { UpdateBoardSectionResult } from './update-board-section.result';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  LearningBoardNotFoundError,
  BoardSectionNotFoundError,
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
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    const section = await this.sectionRepository.findById(payload.sectionId);
    if (!section) {
      throw new BoardSectionNotFoundError({ sectionId: payload.sectionId });
    }

    board.updateSection(payload.sectionId, payload.content, correlationId);
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
