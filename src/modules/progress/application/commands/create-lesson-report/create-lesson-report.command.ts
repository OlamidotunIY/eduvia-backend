import { AttendanceStatus, QuestionSummary } from '../../../domain';

export interface CreateLessonReportPayload {
  lessonId: string;
  orgId: string;
  classroomId: string;
  teacherId: string;
  studentId: string;
  topicNodeIds?: string[];
  attendanceStatus?: AttendanceStatus;
  teacherNarrative?: string | null;
  homeworkSet?: string | null;
  nextSteps?: string | null;
  overallRating?: number | null;
  totalQuestionsAttempted?: number;
  totalQuestionsCorrect?: number;
  totalMarksAwarded?: number | null;
  totalMaxMarks?: number;
  scorePercent?: number | null;
  questionBreakdown?: QuestionSummary[];
  correlationId?: string;
}

export class CreateLessonReportCommand {
  constructor(public readonly payload: CreateLessonReportPayload) {}
}
