import { QuestionType } from '../../domain';

export class CreateAssessmentItemDto {
  boardQuestionId: string;
  studentResponseId: string;
  questionType: QuestionType;
  maxMarks: number;
  autoMarked?: boolean;
  marksAwarded?: number | null;
  feedback?: string | null;
}

export class CreateAssessmentDto {
  lessonId: string;
  boardId: string;
  studentId: string;
  items: CreateAssessmentItemDto[];
}
