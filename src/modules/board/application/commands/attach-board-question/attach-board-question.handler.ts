import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttachBoardQuestionCommand } from './attach-board-question.command';
import { AttachBoardQuestionResult } from './attach-board-question.result';
import {
  ILearningBoardRepository,
  IBoardQuestionRepository,
  LearningBoardNotFoundError,
} from '../../../domain';

@CommandHandler(AttachBoardQuestionCommand)
export class AttachBoardQuestionHandler
  implements ICommandHandler<AttachBoardQuestionCommand, AttachBoardQuestionResult>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly questionRepository: IBoardQuestionRepository,
  ) {}

  async execute(command: AttachBoardQuestionCommand): Promise<AttachBoardQuestionResult> {
    const { payload } = command;
    const correlationId = payload.correlationId ?? crypto.randomUUID();

    const board = await this.boardRepository.findById(payload.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: payload.boardId });
    }

    const question = board.attachQuestion(
      {
        questionId: payload.questionId,
        position: payload.position,
        mode: payload.mode,
        maxMarks: payload.maxMarks,
        showOptions: payload.showOptions,
        dueAt: payload.dueAt,
      },
      correlationId,
    );

    await this.questionRepository.save(question);
    await this.boardRepository.save(board);

    return {
      id: question.id.unpack(),
      boardId: board.id.unpack(),
      questionId: question.questionId,
      position: question.position,
    };
  }
}
