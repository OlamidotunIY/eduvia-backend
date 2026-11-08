import {
  TeacherPerformanceStatProps,
  StudentChurnRiskProps,
  EnrollmentFunnelStatProps,
  FunnelStageProps,
  WeeklyLessonComparisonProps,
  LessonCompletionBreakdownProps,
} from '../../../domain';

export interface OrgAnalyticsDto {
  id: string;
  orgId: string;
  snapshotDate: Date;
  totalActiveStudents: number;
  activeLearnersTrend: number;
  activeLearnersSparkline: number[];
  totalActiveTeachers: number;
  activeTeachersTrend: number;
  activeTeachersSparkline: number[];
  totalLessonsThisMonth: number;
  totalLessonsLastMonth: number;
  lessonsTrend: number;
  lessonsSparkline: number[];
  avgLessonCompletionRate: number;
  completionRateTrend: number;
  completionRateSparkline: number[];
  avgReportSubmissionTimeHours: number;
  avgReportSubmissionTrend: number;
  completionBreakdown: LessonCompletionBreakdownProps;
  weeklyCompletedLessons: WeeklyLessonComparisonProps[];
  teacherPerformance: (TeacherPerformanceStatProps & { completionRate: number })[];
  studentChurnRisk: (StudentChurnRiskProps & {
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
    avgScorePercent: number;
  })[];
  funnelStages: FunnelStageProps[];
  funnelStats: EnrollmentFunnelStatProps & { stages: FunnelStageProps[] };
  availableSnapshotDates: string[];
  createdAt: Date;
  updatedAt: Date;
}
