import { BoardCanvasState, LessonPlanProps } from '../../../domain';

export interface BoardSectionDto {
  id: string;
  boardId: string;
  type: string;
  content: string;
  position: number;
  createdBy: string;
  isTeacherOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardQuestionDetailDto {
  id: string;
  type: string;
  stem: string;
  subject: string;
  difficultyLevel: number;
  maxMarks: number;
  options: Array<{
    id: string;
    key: string;
    text: string;
    imageUrl: string | null;
  }>;
}

export interface BoardQuestionDto {
  id: string;
  boardId: string;
  questionId: string;
  position: number;
  mode: string;
  assignedAt: Date;
  dueAt: Date | null;
  showOptions: boolean;
  maxMarks: number;
  question?: BoardQuestionDetailDto;
}

export interface BoardDetailDto {
  id: string;
  lessonId: string;
  orgId: string;
  mode: string;
  isLocked: boolean;
  plan: LessonPlanProps;
  canvasState?: BoardCanvasState | null;
  sections: BoardSectionDto[];
  questions: BoardQuestionDto[];
  createdAt: Date;
  updatedAt: Date;
}
