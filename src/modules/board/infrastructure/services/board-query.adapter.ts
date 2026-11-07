import { Injectable } from '@nestjs/common';
import {
  IBoardQueryPort,
  SharedBoardDto,
  SharedBoardQuestionDto,
  SharedStudentResponseDto,
} from '@modules/shared';
import {
  ILearningBoardRepository,
  IBoardQuestionRepository,
  IStudentResponseRepository,
} from '../../domain';

@Injectable()
export class BoardQueryAdapter implements IBoardQueryPort {
  constructor(
    private readonly boardRepository: ILearningBoardRepository,
    private readonly boardQuestionRepository: IBoardQuestionRepository,
    private readonly studentResponseRepository: IStudentResponseRepository,
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
      showOptions: q.showOptions,
      maxMarks: q.maxMarks,
    }));
  }

  async getStudentResponseById(
    id: string,
  ): Promise<SharedStudentResponseDto | null> {
    const response = await this.studentResponseRepository.findById(id);
    return response ? this.toStudentResponseDto(response) : null;
  }

  async getStudentResponsesByBoardId(
    boardId: string,
  ): Promise<SharedStudentResponseDto[]> {
    const questions = await this.boardQuestionRepository.findByBoardId(boardId);
    const responses = await Promise.all(
      questions.map((question) =>
        this.studentResponseRepository.findByBoardQuestionId(
          question.id.unpack(),
        ),
      ),
    );
    return responses.flat().map((response) => this.toStudentResponseDto(response));
  }

  private toStudentResponseDto(response: {
    id: { unpack(): string };
    boardQuestionId: string;
    studentId: string;
    responseType: string;
    textContent: string | null | undefined;
    imageUrl: string | null | undefined;
    selectedOption: string | null | undefined;
    submittedAt: Date;
    autoMarkResult: { isCorrect: boolean; marksAwarded: number; markedAt: Date } | null | undefined;
    teacherMark: { marksAwarded: number; maxMarks: number; feedback: string | null; markedBy: string; markedAt: Date } | null | undefined;
  }): SharedStudentResponseDto {
    return {
      id: response.id.unpack(),
      boardQuestionId: response.boardQuestionId,
      studentId: response.studentId,
      responseType: response.responseType,
      textContent: response.textContent ?? null,
      imageUrl: response.imageUrl ?? null,
      selectedOption: response.selectedOption ?? null,
      submittedAt: response.submittedAt,
      autoIsCorrect: response.autoMarkResult?.isCorrect ?? null,
      autoMarksAwarded: response.autoMarkResult?.marksAwarded ?? null,
      autoMarkedAt: response.autoMarkResult?.markedAt ?? null,
      teacherMarksAwarded: response.teacherMark?.marksAwarded ?? null,
      teacherMaxMarks: response.teacherMark?.maxMarks ?? null,
      teacherFeedback: response.teacherMark?.feedback ?? null,
      teacherMarkedBy: response.teacherMark?.markedBy ?? null,
      teacherMarkedAt: response.teacherMark?.markedAt ?? null,
    };
  }
}
