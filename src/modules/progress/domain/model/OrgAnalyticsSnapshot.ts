import {
  OrgAnalyticsSnapshotId,
  TeacherPerformanceStat,
  StudentChurnRisk,
  EnrollmentFunnelStat,
} from '../value-objects';

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
