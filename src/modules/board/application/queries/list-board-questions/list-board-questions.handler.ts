import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListBoardQuestionsQuery } from './list-board-questions.query';
import { BoardQuestionDto } from './list-board-questions.dto';
import { IBoardQuestionRepository } from '../../../domain';

@QueryHandler(ListBoardQuestionsQuery)
export class ListBoardQuestionsHandler
  implements IQueryHandler<ListBoardQuestionsQuery, BoardQuestionDto[]>
{
  constructor(private readonly questionRepository: IBoardQuestionRepository) {}

  async execute(query: ListBoardQuestionsQuery): Promise<BoardQuestionDto[]> {
    const questions = await this.questionRepository.findByBoardId(query.boardId);

    return questions.map((q) => ({
      id: q.id.unpack(),
      boardId: q.boardId,
      questionId: q.questionId,
      position: q.position,
      mode: q.mode,
      assignedAt: q.assignedAt,
      dueAt: q.dueAt ?? null,
      showOptions: q.showOptions,
      maxMarks: q.maxMarks,
    }));
  }
}
