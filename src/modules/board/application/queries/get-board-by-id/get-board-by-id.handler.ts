import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBoardByIdQuery } from './get-board-by-id.query';
import { BoardDetailDto } from './get-board-by-id.dto';
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

    return {
      id: board.id.unpack(),
      lessonId: board.lessonId,
      orgId: board.orgId,
      mode: board.mode,
      isLocked: board.isLocked,
      plan: board.plan.toJSON(),
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
      questions: questions.map((q) => ({
        id: q.id.unpack(),
        boardId: q.boardId,
        questionId: q.questionId,
        position: q.position,
        mode: q.mode,
        assignedAt: q.assignedAt,
        dueAt: q.dueAt ?? null,
        showOptions: q.showOptions,
        maxMarks: q.maxMarks,
      })),
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
