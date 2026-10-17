import {
  TeacherPerformanceStat,
  StudentChurnRisk,
  EnrollmentFunnelStat,
} from '../../../domain';

export interface GenerateOrgAnalyticsSnapshotPayload {
  orgId: string;
  snapshotDate?: Date;
  totalActiveStudents?: number;
  totalActiveTeachers?: number;
  totalLessonsThisMonth?: number;
  totalLessonsLastMonth?: number;
  avgLessonCompletionRate?: number;
  avgReportSubmissionTimeHours?: number;
  teacherPerformance?: TeacherPerformanceStat[];
  studentChurnRisk?: StudentChurnRisk[];
  funnelStats?: EnrollmentFunnelStat;
}

export class GenerateOrgAnalyticsSnapshotCommand {
  constructor(public readonly payload: GenerateOrgAnalyticsSnapshotPayload) {}
}
