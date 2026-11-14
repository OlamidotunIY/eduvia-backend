import { Optional } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { GetBoardByIdQuery } from './get-board-by-id.query';
import { BoardDetailDto } from './get-board-by-id.dto';
import { enrichBoardQuestions } from '../enrich-board-questions';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  IBoardQuestionRepository,
  LearningBoardNotFoundError,
} from '../../../domain';

@QueryHandler(GetBoardByIdQuery)
export class GetBoardByIdHandler
  implements IQueryHandler<GetBoardByIdQuery, BoardDetailDto>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly sectionRepository: IBoardSectionRepository,
    private readonly questionRepository: IBoardQuestionRepository,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async execute(query: GetBoardByIdQuery): Promise<BoardDetailDto> {
    const board = await this.boardRepository.findById(query.boardId);
    if (!board) {
      throw new LearningBoardNotFoundError({ boardId: query.boardId });
    }
    if (query.orgId && board.orgId !== query.orgId) {
      throw new LearningBoardNotFoundError({ boardId: query.boardId });
    }

    const sections = await this.sectionRepository.findByBoardId(board.id.unpack());
    const questions = await this.questionRepository.findByBoardId(board.id.unpack());
    const enrichedQuestions = await enrichBoardQuestions(questions, this.prisma);

    return {
      id: board.id.unpack(),
      lessonId: board.lessonId,
      orgId: board.orgId,
      mode: board.mode,
      isLocked: board.isLocked,
      plan: board.plan.toJSON(),
      canvasState: board.canvasState ?? null,
      sections: sections.map((s) => ({
        id: s.id.unpack(),
        boardId: s.boardId,
        type: s.type,
        content: s.content,
        position: s.position,
        createdBy: s.createdBy,
        isTeacherOnly: s.isTeacherOnly,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      questions: enrichedQuestions,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
