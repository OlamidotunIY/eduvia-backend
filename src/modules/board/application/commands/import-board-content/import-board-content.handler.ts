import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ImportBoardContentCommand } from './import-board-content.command';
import { ImportBoardContentResult } from './import-board-content.result';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  LearningBoardNotFoundError,
} from '../../../domain';

@CommandHandler(ImportBoardContentCommand)
export class ImportBoardContentHandler
  implements ICommandHandler<ImportBoardContentCommand, ImportBoardContentResult>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly sectionRepository: IBoardSectionRepository,
  ) {}

  async execute(command: ImportBoardContentCommand): Promise<ImportBoardContentResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const targetBoard = await this.boardRepository.findById(payload.targetBoardId);
    if (!targetBoard) {
      throw new LearningBoardNotFoundError({ boardId: payload.targetBoardId });
    }

    const sourceSections = await this.sectionRepository.findByBoardId(payload.sourceBoardId);
    targetBoard.importFromBoard(sourceSections, payload.importedBy, correlationId);

    for (const sec of targetBoard.sections) {
      await this.sectionRepository.save(sec);
    }
    await this.boardRepository.save(targetBoard);

    return {
      targetBoardId: targetBoard.id.unpack(),
      importedSectionCount: sourceSections.length,
    };
  }
}
