import {
  ReportStatus,
  AttendanceStatus,
  CommentAuthorRole,
  AssessmentSummaryJSON,
} from '../../../domain';

export interface ReportCommentDto {
  id: string;
  reportId: string;
  authorId: string;
  authorRole: CommentAuthorRole;
  content: string;
  parentCommentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonReportDto {
  id: string;
  lessonId: string;
  orgId: string;
  classroomId: string;
  teacherId: string;
  studentId: string;
  status: ReportStatus;
  topicNodeIds: string[];
  attendanceStatus: AttendanceStatus;
  teacherNarrative: string | null;
  aiGeneratedSummary: string | null;
  teacherApprovedAiSummary: string | null;
  homeworkSet: string | null;
  nextSteps: string | null;
  overallRating: number | null;
  parentCanView: boolean;
  assessmentSummary: AssessmentSummaryJSON;
  comments: ReportCommentDto[];
  submittedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
