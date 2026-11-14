import { Optional } from '@nestjs/common';
import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
import { CreateBoardCommand } from '../../commands';
import { GetBoardByLessonIdQuery } from './get-board-by-lesson-id.query';
import { BoardDetailDto } from './get-board-by-lesson-id.dto';
import { enrichBoardQuestions } from '../enrich-board-questions';
import {
  ILearningBoardRepository,
  IBoardSectionRepository,
  IBoardQuestionRepository,
  LearningBoardNotFoundError,
} from '../../../domain';

@QueryHandler(GetBoardByLessonIdQuery)
export class GetBoardByLessonIdHandler
  implements IQueryHandler<GetBoardByLessonIdQuery, BoardDetailDto>
{
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly sectionRepository: IBoardSectionRepository,
    private readonly questionRepository: IBoardQuestionRepository,
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly commandBus?: CommandBus,
  ) {}

  async execute(query: GetBoardByLessonIdQuery): Promise<BoardDetailDto> {
    let board = await this.boardRepository.findByLessonId(query.lessonId);
    if (!board && this.prisma && this.commandBus) {
      // Backfill/lazy-create missing board if the lesson exists (e.g., missed async LessonCreatedEvent).
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: query.lessonId },
        select: { id: true, orgId: true },
      });
      if (!lesson || (query.orgId && lesson.orgId !== query.orgId)) {
        throw new LearningBoardNotFoundError({ lessonId: query.lessonId });
      }
      try {
        await this.commandBus.execute(
          new CreateBoardCommand({
            lessonId: lesson.id,
            orgId: lesson.orgId,
          }),
        );
      } catch {
        // Ignore concurrent board creation; re-read below will resolve it if created.
      }
      board = await this.boardRepository.findByLessonId(query.lessonId);
    }
    if (!board) {
      throw new LearningBoardNotFoundError({ lessonId: query.lessonId });
    }
    if (query.orgId && board.orgId !== query.orgId) {
      throw new LearningBoardNotFoundError({ lessonId: query.lessonId });
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
