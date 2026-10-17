import {
  TeacherPerformanceStatProps,
  StudentChurnRiskProps,
  EnrollmentFunnelStatProps,
} from '../../../domain';

export interface OrgAnalyticsDto {
  id: string;
  orgId: string;
  snapshotDate: Date;
  totalActiveStudents: number;
  totalActiveTeachers: number;
  totalLessonsThisMonth: number;
  totalLessonsLastMonth: number;
  avgLessonCompletionRate: number;
  avgReportSubmissionTimeHours: number;
  teacherPerformance: TeacherPerformanceStatProps[];
  studentChurnRisk: StudentChurnRiskProps[];
  funnelStats: EnrollmentFunnelStatProps;
  createdAt: Date;
  updatedAt: Date;
}
