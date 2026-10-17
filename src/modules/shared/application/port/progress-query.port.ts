export interface SharedLessonReportDto {
  id: string;
  lessonId: string;
  orgId: string;
  classroomId: string;
  teacherId: string;
  studentId: string;
  status: string;
  topicNodeIds: string[];
  attendanceStatus: string;
  teacherNarrative: string | null;
  aiGeneratedSummary: string | null;
  teacherApprovedAiSummary: string | null;
  overallRating: number | null;
  parentCanView: boolean;
  scorePercent: number | null;
  submittedAt: Date | null;
  archivedAt: Date | null;
}

export interface SharedStudentProgressDto {
  id: string;
  studentId: string;
  orgId: string;
  subjectId: string;
  totalLessonsAttended: number;
  totalLessonsMissed: number;
  totalAssessments: number;
  averageScorePercent: number | null;
  overallMasteryLevel: number | null;
  lastLessonAt: Date | null;
  lastUpdatedAt: Date;
}

export interface SharedOrgAnalyticsDto {
  id: string;
  orgId: string;
  snapshotDate: Date;
  totalActiveStudents: number;
  totalActiveTeachers: number;
  avgLessonCompletionRate: number;
  avgReportSubmissionTimeHours: number;
}

export abstract class IProgressQueryPort {
  public abstract getLessonReportById(id: string): Promise<SharedLessonReportDto | null>;
  public abstract getLessonReportByLessonId(
    lessonId: string,
  ): Promise<SharedLessonReportDto | null>;
  public abstract getStudentProgress(
    studentId: string,
    orgId?: string,
    subjectId?: string,
  ): Promise<SharedStudentProgressDto[]>;
  public abstract getLatestOrgAnalytics(
    orgId: string,
  ): Promise<SharedOrgAnalyticsDto | null>;
}
