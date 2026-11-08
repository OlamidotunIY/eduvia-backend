import { ApiProperty } from '@nestjs/swagger';

export class WeeklyLessonComparisonDTO {
  @ApiProperty({ example: 'Week 1' })
  week: string;

  @ApiProperty({ example: 42 })
  thisMonth: number;

  @ApiProperty({ example: 32 })
  lastMonth: number;
}

export class LessonCompletionBreakdownDTO {
  @ApiProperty({ example: 92.4 })
  completedPercentage: number;

  @ApiProperty({ example: 5.1 })
  inProgressPercentage: number;

  @ApiProperty({ example: 2.5 })
  notStartedPercentage: number;
}

export class TeacherPerformanceDTO {
  @ApiProperty({ example: 'teacher-1' })
  teacherId: string;

  @ApiProperty({ example: 'Adenike Okafor' })
  teacherName: string;

  @ApiProperty({ example: 'Lead Teacher', required: false })
  teacherRole?: string;

  @ApiProperty({ example: null, nullable: true, required: false })
  avatarUrl?: string | null;

  @ApiProperty({ example: 98 })
  completionRate: number;

  @ApiProperty({ example: 48 })
  lessonsDelivered: number;

  @ApiProperty({ example: 4.5 })
  avgReportSubmissionHours: number;

  @ApiProperty({ example: 88, nullable: true, required: false })
  avgStudentScorePercent?: number | null;

  @ApiProperty({ example: 98 })
  reportCompletionRate: number;

  @ApiProperty({ example: 95 })
  studentRetentionRate: number;
}

export class StudentChurnRiskDTO {
  @ApiProperty({ example: 'student-1' })
  studentId: string;

  @ApiProperty({ example: 'Tariq Musa' })
  studentName: string;

  @ApiProperty({ example: null, nullable: true, required: false })
  avatarUrl?: string | null;

  @ApiProperty({ example: 'Grade 6 · Mathematics' })
  gradeSubject: string;

  @ApiProperty({ enum: ['high', 'medium', 'low'], example: 'high' })
  riskLevel: 'high' | 'medium' | 'low';

  @ApiProperty({ example: 'Low activity · 3 days inactive' })
  reason: string;

  @ApiProperty({ example: 42 })
  avgScorePercent: number;

  @ApiProperty({ example: 0.85 })
  riskScore: number;

  @ApiProperty({ type: [String], example: ['Low activity · 3 days inactive'] })
  riskFactors: string[];

  @ApiProperty({ example: null, nullable: true, required: false })
  lastLessonAt?: string | null;
}

export class FunnelStageDTO {
  @ApiProperty({ example: 'Invited' })
  stage: string;

  @ApiProperty({ example: 320 })
  count: number;

  @ApiProperty({ example: 100 })
  percentage: number;
}

export class FunnelStatsDTO {
  @ApiProperty({ example: 320 })
  totalLeads: number;

  @ApiProperty({ example: 286 })
  trialLessonsBooked: number;

  @ApiProperty({ example: 248 })
  trialLessonsCompleted: number;

  @ApiProperty({ example: 192 })
  enrolledStudents: number;

  @ApiProperty({ example: 60 })
  conversionRate: number;

  @ApiProperty({ type: [FunnelStageDTO], required: false })
  stages?: FunnelStageDTO[];
}

export class OrgAnalyticsResponseDTO {
  @ApiProperty({ example: 'snapshot-123' })
  id: string;

  @ApiProperty({ example: 'org-123' })
  orgId: string;

  @ApiProperty({ example: '2026-11-08T00:00:00.000Z' })
  snapshotDate: string;

  @ApiProperty({ example: 248 })
  totalActiveStudents: number;

  @ApiProperty({ example: 12 })
  activeLearnersTrend: number;

  @ApiProperty({ type: [Number], example: [210, 218, 225, 235, 248] })
  activeLearnersSparkline: number[];

  @ApiProperty({ example: 18 })
  totalActiveTeachers: number;

  @ApiProperty({ example: 6 })
  activeTeachersTrend: number;

  @ApiProperty({ type: [Number], example: [15, 16, 17, 18, 18] })
  activeTeachersSparkline: number[];

  @ApiProperty({ example: 436 })
  totalLessonsThisMonth: number;

  @ApiProperty({ example: 402 })
  totalLessonsLastMonth: number;

  @ApiProperty({ example: 9 })
  lessonsTrend: number;

  @ApiProperty({ type: [Number], example: [380, 395, 410, 422, 436] })
  lessonsSparkline: number[];

  @ApiProperty({ example: 92.4 })
  avgLessonCompletionRate: number;

  @ApiProperty({ example: 3.2 })
  completionRateTrend: number;

  @ApiProperty({ type: [Number], example: [88.5, 89.8, 90.6, 91.5, 92.4] })
  completionRateSparkline: number[];

  @ApiProperty({ example: 8.2 })
  avgReportSubmissionTimeHours: number;

  @ApiProperty({ example: -34 })
  avgReportSubmissionTrend: number;

  @ApiProperty({ type: LessonCompletionBreakdownDTO })
  completionBreakdown: LessonCompletionBreakdownDTO;

  @ApiProperty({ type: [WeeklyLessonComparisonDTO] })
  weeklyCompletedLessons: WeeklyLessonComparisonDTO[];

  @ApiProperty({ type: [TeacherPerformanceDTO] })
  teacherPerformance: TeacherPerformanceDTO[];

  @ApiProperty({ type: [StudentChurnRiskDTO] })
  studentChurnRisk: StudentChurnRiskDTO[];

  @ApiProperty({ type: [FunnelStageDTO] })
  funnelStages: FunnelStageDTO[];

  @ApiProperty({ type: FunnelStatsDTO })
  funnelStats: FunnelStatsDTO;

  @ApiProperty({ type: [String], example: ['2026-11-08', '2026-11-01'] })
  availableSnapshotDates: string[];

  @ApiProperty({ example: '2026-11-08T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-11-08T00:00:00.000Z' })
  updatedAt: string;
}
