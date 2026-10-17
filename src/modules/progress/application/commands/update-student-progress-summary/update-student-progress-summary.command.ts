export interface UpdateStudentProgressSummaryPayload {
  studentId: string;
  orgId: string;
  subjectId: string;
  totalLessonsAttended?: number;
  totalLessonsMissed?: number;
  totalAssessments?: number;
  averageScorePercent?: number | null;
  masteredTopicsCount?: number;
  inProgressTopicsCount?: number;
  notStartedTopicsCount?: number;
  overallMasteryLevel?: number | null;
  lastLessonAt?: Date | null;
}

export class UpdateStudentProgressSummaryCommand {
  constructor(public readonly payload: UpdateStudentProgressSummaryPayload) {}
}
