import {
  OrgAnalyticsSnapshotId,
  TeacherPerformanceStat,
  StudentChurnRisk,
  EnrollmentFunnelStat,
} from '../value-objects';

export interface WeeklyLessonComparisonProps {
  week: string;
  thisMonth: number;
  lastMonth: number;
}

export interface LessonCompletionBreakdownProps {
  completedPercentage: number;
  inProgressPercentage: number;
  notStartedPercentage: number;
}

export interface OrgAnalyticsSnapshotProps {
  id: OrgAnalyticsSnapshotId;
  orgId: string;
  snapshotDate: Date;
  totalActiveStudents: number;
  totalActiveTeachers: number;
  totalLessonsThisMonth: number;
  totalLessonsLastMonth: number;
  avgLessonCompletionRate: number;
  avgReportSubmissionTimeHours: number;
  activeLearnersTrend?: number;
  activeLearnersSparkline?: number[];
  activeTeachersTrend?: number;
  activeTeachersSparkline?: number[];
  lessonsTrend?: number;
  lessonsSparkline?: number[];
  completionRateTrend?: number;
  completionRateSparkline?: number[];
  weeklyCompletedLessons?: WeeklyLessonComparisonProps[];
  avgReportSubmissionTrend?: number;
  completionBreakdown?: LessonCompletionBreakdownProps;
  teacherPerformance: TeacherPerformanceStat[];
  studentChurnRisk: StudentChurnRisk[];
  funnelStats: EnrollmentFunnelStat;
  createdAt: Date;
  updatedAt: Date;
}

export class OrgAnalyticsSnapshot {
  public readonly id: OrgAnalyticsSnapshotId;
  private _orgId: string;
  private _snapshotDate: Date;
  private _totalActiveStudents: number;
  private _totalActiveTeachers: number;
  private _totalLessonsThisMonth: number;
  private _totalLessonsLastMonth: number;
  private _avgLessonCompletionRate: number;
  private _avgReportSubmissionTimeHours: number;
  private _activeLearnersTrend: number;
  private _activeLearnersSparkline: number[];
  private _activeTeachersTrend: number;
  private _activeTeachersSparkline: number[];
  private _lessonsTrend: number;
  private _lessonsSparkline: number[];
  private _completionRateTrend: number;
  private _completionRateSparkline: number[];
  private _weeklyCompletedLessons: WeeklyLessonComparisonProps[];
  private _avgReportSubmissionTrend: number;
  private _completionBreakdown: LessonCompletionBreakdownProps;
  private _teacherPerformance: TeacherPerformanceStat[];
  private _studentChurnRisk: StudentChurnRisk[];
  private _funnelStats: EnrollmentFunnelStat;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: OrgAnalyticsSnapshotProps) {
    this.id = props.id;
    this._orgId = props.orgId;
    this._snapshotDate = new Date(props.snapshotDate);
    this._totalActiveStudents = props.totalActiveStudents;
    this._totalActiveTeachers = props.totalActiveTeachers;
    this._totalLessonsThisMonth = props.totalLessonsThisMonth;
    this._totalLessonsLastMonth = props.totalLessonsLastMonth;
    this._avgLessonCompletionRate = props.avgLessonCompletionRate;
    this._avgReportSubmissionTimeHours = props.avgReportSubmissionTimeHours;
    this._activeLearnersTrend = props.activeLearnersTrend ?? 0;
    this._activeLearnersSparkline = props.activeLearnersSparkline ?? [];
    this._activeTeachersTrend = props.activeTeachersTrend ?? 0;
    this._activeTeachersSparkline = props.activeTeachersSparkline ?? [];
    this._lessonsTrend = props.lessonsTrend ?? 0;
    this._lessonsSparkline = props.lessonsSparkline ?? [];
    this._completionRateTrend = props.completionRateTrend ?? 0;
    this._completionRateSparkline = props.completionRateSparkline ?? [];
    this._weeklyCompletedLessons = props.weeklyCompletedLessons ?? [
      { week: 'Week 1', thisMonth: 0, lastMonth: 0 },
      { week: 'Week 2', thisMonth: 0, lastMonth: 0 },
      { week: 'Week 3', thisMonth: 0, lastMonth: 0 },
      { week: 'Week 4', thisMonth: 0, lastMonth: 0 },
    ];
    this._avgReportSubmissionTrend = props.avgReportSubmissionTrend ?? 0;
    this._completionBreakdown = props.completionBreakdown ?? {
      completedPercentage: 0,
      inProgressPercentage: 0,
      notStartedPercentage: 0,
    };
    this._teacherPerformance = [...props.teacherPerformance];
    this._studentChurnRisk = [...props.studentChurnRisk];
    this._funnelStats = props.funnelStats;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: OrgAnalyticsSnapshotId;
    orgId: string;
    snapshotDate?: Date;
    totalActiveStudents: number;
    totalActiveTeachers: number;
    totalLessonsThisMonth: number;
    totalLessonsLastMonth: number;
    avgLessonCompletionRate: number;
    avgReportSubmissionTimeHours: number;
    activeLearnersTrend?: number;
    activeLearnersSparkline?: number[];
    activeTeachersTrend?: number;
    activeTeachersSparkline?: number[];
    lessonsTrend?: number;
    lessonsSparkline?: number[];
    completionRateTrend?: number;
    completionRateSparkline?: number[];
    weeklyCompletedLessons?: WeeklyLessonComparisonProps[];
    avgReportSubmissionTrend?: number;
    completionBreakdown?: LessonCompletionBreakdownProps;
    teacherPerformance: TeacherPerformanceStat[];
    studentChurnRisk: StudentChurnRisk[];
    funnelStats: EnrollmentFunnelStat;
  }): OrgAnalyticsSnapshot {
    const now = new Date();
    return new OrgAnalyticsSnapshot({
      id: props.id ?? OrgAnalyticsSnapshotId.create(),
      orgId: props.orgId,
      snapshotDate: props.snapshotDate ?? now,
      totalActiveStudents: props.totalActiveStudents,
      totalActiveTeachers: props.totalActiveTeachers,
      totalLessonsThisMonth: props.totalLessonsThisMonth,
      totalLessonsLastMonth: props.totalLessonsLastMonth,
      avgLessonCompletionRate: props.avgLessonCompletionRate,
      avgReportSubmissionTimeHours: props.avgReportSubmissionTimeHours,
      activeLearnersTrend: props.activeLearnersTrend,
      activeLearnersSparkline: props.activeLearnersSparkline,
      activeTeachersTrend: props.activeTeachersTrend,
      activeTeachersSparkline: props.activeTeachersSparkline,
      lessonsTrend: props.lessonsTrend,
      lessonsSparkline: props.lessonsSparkline,
      completionRateTrend: props.completionRateTrend,
      completionRateSparkline: props.completionRateSparkline,
      weeklyCompletedLessons: props.weeklyCompletedLessons,
      avgReportSubmissionTrend: props.avgReportSubmissionTrend,
      completionBreakdown: props.completionBreakdown,
      teacherPerformance: props.teacherPerformance,
      studentChurnRisk: props.studentChurnRisk,
      funnelStats: props.funnelStats,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: OrgAnalyticsSnapshotProps): OrgAnalyticsSnapshot {
    return new OrgAnalyticsSnapshot(props);
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get snapshotDate(): Date {
    return new Date(this._snapshotDate);
  }

  public get totalActiveStudents(): number {
    return this._totalActiveStudents;
  }

  public get totalActiveTeachers(): number {
    return this._totalActiveTeachers;
  }

  public get totalLessonsThisMonth(): number {
    return this._totalLessonsThisMonth;
  }

  public get totalLessonsLastMonth(): number {
    return this._totalLessonsLastMonth;
  }

  public get avgLessonCompletionRate(): number {
    return this._avgLessonCompletionRate;
  }

  public get avgReportSubmissionTimeHours(): number {
    return this._avgReportSubmissionTimeHours;
  }

  public get activeLearnersTrend(): number {
    return this._activeLearnersTrend;
  }

  public get activeLearnersSparkline(): readonly number[] {
    return this._activeLearnersSparkline;
  }

  public get activeTeachersTrend(): number {
    return this._activeTeachersTrend;
  }

  public get activeTeachersSparkline(): readonly number[] {
    return this._activeTeachersSparkline;
  }

  public get lessonsTrend(): number {
    return this._lessonsTrend;
  }

  public get lessonsSparkline(): readonly number[] {
    return this._lessonsSparkline;
  }

  public get completionRateTrend(): number {
    return this._completionRateTrend;
  }

  public get completionRateSparkline(): readonly number[] {
    return this._completionRateSparkline;
  }

  public get weeklyCompletedLessons(): readonly WeeklyLessonComparisonProps[] {
    return this._weeklyCompletedLessons;
  }

  public get avgReportSubmissionTrend(): number {
    return this._avgReportSubmissionTrend;
  }

  public get completionBreakdown(): LessonCompletionBreakdownProps {
    return this._completionBreakdown;
  }

  public get teacherPerformance(): readonly TeacherPerformanceStat[] {
    return this._teacherPerformance;
  }

  public get studentChurnRisk(): readonly StudentChurnRisk[] {
    return this._studentChurnRisk;
  }

  public get funnelStats(): EnrollmentFunnelStat {
    return this._funnelStats;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
}
