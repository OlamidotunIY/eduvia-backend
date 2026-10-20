import { Injectable } from '@nestjs/common';
import {
  IBoardQueryPort,
  SharedBoardDto,
  SharedBoardQuestionDto,
} from '@modules/shared';
import {
  ILearningBoardRepository,
  IBoardQuestionRepository,
} from '../../domain';

@Injectable()
export class BoardQueryAdapter implements IBoardQueryPort {
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly boardQuestionRepository: IBoardQuestionRepository,
  ) {}

  async getBoardById(id: string): Promise<SharedBoardDto | null> {
    const board = await this.boardRepository.findById(id);
    if (!board) return null;
    return {
      id: board.id.unpack(),
      lessonId: board.lessonId,
      orgId: board.orgId,
      mode: board.mode,
      isLocked: board.isLocked,
      isPlanComplete: board.plan.isComplete,
      planCompletedAt: board.plan.completedAt ?? null,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }

  async getBoardByLessonId(lessonId: string): Promise<SharedBoardDto | null> {
    const board = await this.boardRepository.findByLessonId(lessonId);
    if (!board) return null;
    return {
      id: board.id.unpack(),
      lessonId: board.lessonId,
      orgId: board.orgId,
      mode: board.mode,
      isLocked: board.isLocked,
      isPlanComplete: board.plan.isComplete,
      planCompletedAt: board.plan.completedAt ?? null,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }

  async isPlanComplete(lessonId: string): Promise<boolean> {
    const board = await this.boardRepository.findByLessonId(lessonId);
    if (!board) return false;
    return board.plan.isComplete;
  }

  async getBoardQuestions(boardId: string): Promise<SharedBoardQuestionDto[]> {
    const questions = await this.boardQuestionRepository.findByBoardId(boardId);
    return questions.map((q) => ({
      id: q.id.unpack(),
      boardId: q.boardId,
      questionId: q.questionId,
      position: q.position,
      mode: q.mode,
      maxMarks: q.maxMarks,
    }));
  }
}
