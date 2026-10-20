import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveBoardQuestionCommand } from './remove-board-question.command';
import { RemoveBoardQuestionResult } from './remove-board-question.result';
import {
  ILearningBoardRepository,
  IBoardQuestionRepository,
  LearningBoardNotFoundError,
} from '../../../domain';

@CommandHandler(RemoveBoardQuestionCommand)
export class RemoveBoardQuestionHandler
  implements ICommandHandler<RemoveBoardQuestionCommand, RemoveBoardQuestionResult>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly questionRepository: IBoardQuestionRepository,
  ) {}

  async execute(command: RemoveBoardQuestionCommand): Promise<RemoveBoardQuestionResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    board.removeQuestion(payload.boardQuestionId, correlationId);
    await this.questionRepository.delete(payload.boardQuestionId);
    await this.boardRepository.save(board);

    return {
      id: payload.boardQuestionId,
      boardId: board.id.unpack(),
    };
  }
}
