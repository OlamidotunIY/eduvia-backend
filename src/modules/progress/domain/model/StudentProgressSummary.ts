import { StudentProgressSummaryId } from '../value-objects';

export interface StudentProgressSummaryProps {
  id: StudentProgressSummaryId;
  studentId: string;
  orgId: string;
  subjectId: string;
  totalLessonsAttended: number;
  totalLessonsMissed: number;
  totalAssessments: number;
  averageScorePercent?: number | null;
  masteredTopicsCount: number;
  inProgressTopicsCount: number;
  notStartedTopicsCount: number;
  overallMasteryLevel?: number | null;
  lastLessonAt?: Date | null;
  lastUpdatedAt: Date;
}

export class StudentProgressSummary {
  public readonly id: StudentProgressSummaryId;
  private _studentId: string;
  private _orgId: string;
  private _subjectId: string;
  private _totalLessonsAttended: number;
  private _totalLessonsMissed: number;
  private _totalAssessments: number;
  private _averageScorePercent: number | null;
  private _masteredTopicsCount: number;
  private _inProgressTopicsCount: number;
  private _notStartedTopicsCount: number;
  private _overallMasteryLevel: number | null;
  private _lastLessonAt: Date | null;
  private _lastUpdatedAt: Date;

  protected constructor(props: StudentProgressSummaryProps) {
    this.id = props.id;
    this._studentId = props.studentId;
    this._orgId = props.orgId;
    this._subjectId = props.subjectId;
    this._totalLessonsAttended = props.totalLessonsAttended;
    this._totalLessonsMissed = props.totalLessonsMissed;
    this._totalAssessments = props.totalAssessments;
    this._averageScorePercent = props.averageScorePercent ?? null;
    this._masteredTopicsCount = props.masteredTopicsCount;
    this._inProgressTopicsCount = props.inProgressTopicsCount;
    this._notStartedTopicsCount = props.notStartedTopicsCount;
    this._overallMasteryLevel = props.overallMasteryLevel ?? null;
    this._lastLessonAt = props.lastLessonAt ? new Date(props.lastLessonAt) : null;
    this._lastUpdatedAt = new Date(props.lastUpdatedAt);
  }

  public static create(props: {
    id?: StudentProgressSummaryId;
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
  }): StudentProgressSummary {
    return new StudentProgressSummary({
      id: props.id ?? StudentProgressSummaryId.create(),
      studentId: props.studentId,
      orgId: props.orgId,
      subjectId: props.subjectId,
      totalLessonsAttended: props.totalLessonsAttended ?? 0,
      totalLessonsMissed: props.totalLessonsMissed ?? 0,
      totalAssessments: props.totalAssessments ?? 0,
      averageScorePercent: props.averageScorePercent ?? null,
      masteredTopicsCount: props.masteredTopicsCount ?? 0,
      inProgressTopicsCount: props.inProgressTopicsCount ?? 0,
      notStartedTopicsCount: props.notStartedTopicsCount ?? 0,
      overallMasteryLevel: props.overallMasteryLevel ?? null,
      lastLessonAt: props.lastLessonAt ?? null,
      lastUpdatedAt: new Date(),
    });
  }

  public static reconstitute(props: StudentProgressSummaryProps): StudentProgressSummary {
    return new StudentProgressSummary(props);
  }

  public updateMetrics(props: {
    totalLessonsAttended?: number;
    totalLessonsMissed?: number;
    totalAssessments?: number;
    averageScorePercent?: number | null;
    masteredTopicsCount?: number;
    inProgressTopicsCount?: number;
    notStartedTopicsCount?: number;
    overallMasteryLevel?: number | null;
    lastLessonAt?: Date | null;
  }): void {
    if (props.totalLessonsAttended !== undefined) {
      this._totalLessonsAttended = props.totalLessonsAttended;
    }
    if (props.totalLessonsMissed !== undefined) {
      this._totalLessonsMissed = props.totalLessonsMissed;
    }
    if (props.totalAssessments !== undefined) {
      this._totalAssessments = props.totalAssessments;
    }
    if (props.averageScorePercent !== undefined) {
      this._averageScorePercent = props.averageScorePercent;
    }
    if (props.masteredTopicsCount !== undefined) {
      this._masteredTopicsCount = props.masteredTopicsCount;
    }
    if (props.inProgressTopicsCount !== undefined) {
      this._inProgressTopicsCount = props.inProgressTopicsCount;
    }
    if (props.notStartedTopicsCount !== undefined) {
      this._notStartedTopicsCount = props.notStartedTopicsCount;
    }
    if (props.overallMasteryLevel !== undefined) {
      this._overallMasteryLevel = props.overallMasteryLevel;
    }
    if (props.lastLessonAt !== undefined) {
      this._lastLessonAt = props.lastLessonAt ? new Date(props.lastLessonAt) : null;
    }
    this._lastUpdatedAt = new Date();
  }

  public get studentId(): string {
    return this._studentId;
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get subjectId(): string {
    return this._subjectId;
  }

  public get totalLessonsAttended(): number {
    return this._totalLessonsAttended;
  }

  public get totalLessonsMissed(): number {
    return this._totalLessonsMissed;
  }

  public get totalAssessments(): number {
    return this._totalAssessments;
  }

  public get averageScorePercent(): number | null {
    return this._averageScorePercent;
  }

  public get masteredTopicsCount(): number {
    return this._masteredTopicsCount;
  }

  public get inProgressTopicsCount(): number {
    return this._inProgressTopicsCount;
  }

  public get notStartedTopicsCount(): number {
    return this._notStartedTopicsCount;
  }

  public get overallMasteryLevel(): number | null {
    return this._overallMasteryLevel;
  }

  public get lastLessonAt(): Date | null {
    return this._lastLessonAt ? new Date(this._lastLessonAt) : null;
  }

  public get lastUpdatedAt(): Date {
    return new Date(this._lastUpdatedAt);
  }
}
