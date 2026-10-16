export interface SharedBoardDto {
  id: string;
  lessonId: string;
  orgId: string;
  mode: string;
  isLocked: boolean;
  isPlanComplete: boolean;
  planCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedLessonPlanDto {
  learningObjectives: string[];
  topicsCovered: string[];
  teachingNotes: string | null;
  homeworkDescription: string | null;
  isComplete: boolean;
  completedAt: Date | null;
}

export interface SharedBoardQuestionDto {
  id: string;
  boardId: string;
  questionId: string;
  position: number;
  mode: string;
  maxMarks: number;
}

export abstract class IBoardQueryPort {
  public abstract getBoardById(id: string): Promise<SharedBoardDto | null>;
  public abstract getBoardByLessonId(lessonId: string): Promise<SharedBoardDto | null>;
  public abstract isPlanComplete(lessonId: string): Promise<boolean>;
  public abstract getBoardQuestions(boardId: string): Promise<SharedBoardQuestionDto[]>;
}
