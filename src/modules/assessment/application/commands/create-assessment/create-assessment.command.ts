import { MarkingStatus, QuestionType } from '../../../domain';

export interface CreateAssessmentItemPayload {
  boardQuestionId: string;
  studentResponseId: string;
  questionType: QuestionType;
  maxMarks: number;
  autoMarked?: boolean;
  marksAwarded?: number | null;
  feedback?: string | null;
  markedBy?: string | null;
  status?: MarkingStatus;
}

export interface CreateAssessmentPayload {
  orgId: string;
  lessonId: string;
  boardId: string;
  studentId: string;
  items: CreateAssessmentItemPayload[];
  correlationId?: string;
}

export class CreateAssessmentCommand {
  constructor(public readonly payload: CreateAssessmentPayload) {}
}
