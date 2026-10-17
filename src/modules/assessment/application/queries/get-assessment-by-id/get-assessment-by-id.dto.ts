export interface MarkingItemDetailDto {
  id: string;
  assessmentId: string;
  boardQuestionId: string;
  studentResponseId: string;
  questionType: string;
  maxMarks: number;
  autoMarked: boolean;
  marksAwarded: number | null;
  feedback: string | null;
  markedBy: string | null;
  markedAt: Date | null;
  status: string;
}

export interface AssessmentDetailDto {
  id: string;
  orgId: string;
  lessonId: string;
  boardId: string;
  studentId: string;
  status: string;
  totalMaxMarks: number;
  totalMarksAwarded: number | null;
  scorePercent: number | null;
  autoMarkedCount: number;
  teacherMarkedCount: number;
  pendingMarkCount: number;
  markingItems: MarkingItemDetailDto[];
  createdAt: Date;
  updatedAt: Date;
}
