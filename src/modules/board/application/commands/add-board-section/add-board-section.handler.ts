import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddBoardSectionCommand } from './add-board-section.command';
import { AddBoardSectionResult } from './add-board-section.result';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  LearningBoardNotFoundError,
} from '../../../domain';

@CommandHandler(AddBoardSectionCommand)
export class AddBoardSectionHandler
  implements ICommandHandler<AddBoardSectionCommand, AddBoardSectionResult>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly sectionRepository: IBoardSectionRepository,
  ) {}

  async execute(command: AddBoardSectionCommand): Promise<AddBoardSectionResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    const section = board.addSection(
      {
        type: payload.type,
        content: payload.content,
        position: payload.position,
        createdBy: payload.createdBy,
        isTeacherOnly: payload.isTeacherOnly,
      },
      correlationId,
    );

    await this.sectionRepository.save(section);
    await this.boardRepository.save(board);

    return {
      id: section.id.unpack(),
      boardId: board.id.unpack(),
      position: section.position,
    };
  }
}
