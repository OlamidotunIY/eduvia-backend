export interface SubmitStudentResponseResult {
  id: string;
  boardQuestionId: string;
  studentId: string;
  submittedAt: Date;
  autoMarked: boolean;
  marksAwarded?: number | null;
}
