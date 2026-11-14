import { Optional } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { ListBoardQuestionsQuery } from './list-board-questions.query';
import { BoardQuestionDto } from './list-board-questions.dto';
import { enrichBoardQuestions } from '../enrich-board-questions';
import { IBoardQuestionRepository } from '../../../domain';

@QueryHandler(ListBoardQuestionsQuery)
export class ListBoardQuestionsHandler
  implements IQueryHandler<ListBoardQuestionsQuery, BoardQuestionDto[]>
{
  constructor(
    private readonly questionRepository: IBoardQuestionRepository,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async execute(query: ListBoardQuestionsQuery): Promise<BoardQuestionDto[]> {
    const questions = await this.questionRepository.findByBoardId(query.boardId);
    return enrichBoardQuestions(questions, this.prisma);
  }
}
