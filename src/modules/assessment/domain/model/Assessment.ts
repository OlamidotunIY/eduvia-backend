import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared';
import {
  AssessmentId,
  AssessmentStatus,
  MarkingStatus,
} from '../value-objects';
import { MarkingItem } from '../entities/marking-item.entity';
import {
  AssessmentCreatedEvent,
  AssessmentMarkAppliedEvent,
  AssessmentFinalizedEvent,
} from '../events';
import {
  AssessmentAlreadyFinalizedError,
  MarkingItemNotFoundError,
} from '../errors';

export interface AssessmentProps {
  id: AssessmentId;
  orgId: string;
  lessonId: string;
  boardId: string;
  studentId: string;
  status: AssessmentStatus;
  totalMaxMarks: number;
  totalMarksAwarded?: number | null;
  scorePercent?: number | null;
  autoMarkedCount: number;
  teacherMarkedCount: number;
  pendingMarkCount: number;
  markingItems?: MarkingItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Assessment extends AggregateRoot<AssessmentId> {
  private _orgId: string;
  private _lessonId: string;
  private _boardId: string;
  private _studentId: string;
  private _status: AssessmentStatus;
  private _totalMaxMarks: number;
  private _totalMarksAwarded: number | null;
  private _scorePercent: number | null;
  private _autoMarkedCount: number;
  private _teacherMarkedCount: number;
  private _pendingMarkCount: number;
  private _markingItems: MarkingItem[];
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: AssessmentProps) {
    super(props.id);
    this._orgId = props.orgId;
    this._lessonId = props.lessonId;
    this._boardId = props.boardId;
    this._studentId = props.studentId;
    this._status = props.status;
    this._totalMaxMarks = props.totalMaxMarks;
    this._totalMarksAwarded = props.totalMarksAwarded ?? null;
    this._scorePercent = props.scorePercent ?? null;
    this._autoMarkedCount = props.autoMarkedCount;
    this._teacherMarkedCount = props.teacherMarkedCount;
    this._pendingMarkCount = props.pendingMarkCount;
    this._markingItems = props.markingItems ? [...props.markingItems] : [];
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(
    props: {
      id?: AssessmentId;
      orgId: string;
      lessonId: string;
      boardId: string;
      studentId: string;
      markingItems: MarkingItem[];
    },
    correlationId = 'system',
  ): Assessment {
    const assessmentId = props.id ?? AssessmentId.create();
    const items = props.markingItems ?? [];

    let totalMaxMarks = 0;
    let autoMarkedCount = 0;
    let teacherMarkedCount = 0;
    let pendingMarkCount = 0;
    let totalMarksAwarded = 0;

    for (const item of items) {
      totalMaxMarks += item.maxMarks;
      if (item.status === MarkingStatus.auto_marked) {
        autoMarkedCount++;
        totalMarksAwarded += item.marksAwarded ?? 0;
      } else if (item.status === MarkingStatus.teacher_marked) {
        teacherMarkedCount++;
        totalMarksAwarded += item.marksAwarded ?? 0;
      } else {
        pendingMarkCount++;
      }
    }

    let status = AssessmentStatus.pending_marking;
    let scorePercent: number | null = null;
    let marksAwardedResult: number | null = null;

    if (pendingMarkCount === 0 && items.length > 0) {
      status = AssessmentStatus.fully_marked;
      marksAwardedResult = totalMarksAwarded;
      scorePercent =
        totalMaxMarks > 0 ? (totalMarksAwarded / totalMaxMarks) * 100 : 100;
    } else if (autoMarkedCount > 0 || teacherMarkedCount > 0) {
      status = AssessmentStatus.partially_marked;
    }

    const now = new Date();
    const assessment = new Assessment({
      id: assessmentId,
      orgId: props.orgId,
      lessonId: props.lessonId,
      boardId: props.boardId,
      studentId: props.studentId,
      status,
      totalMaxMarks,
      totalMarksAwarded: marksAwardedResult,
      scorePercent,
      autoMarkedCount,
      teacherMarkedCount,
      pendingMarkCount,
      markingItems: items,
      createdAt: now,
      updatedAt: now,
    });

    assessment.addDomainEvent(
      new AssessmentCreatedEvent(
        assessmentId.value,
        new AssessmentCreatedEvent.Payload(
          assessmentId.value,
          assessment.lessonId,
          assessment.studentId,
          assessment.orgId,
        ),
        correlationId,
      ),
    );

    if (assessment.status === AssessmentStatus.fully_marked) {
      assessment.addDomainEvent(
        new AssessmentFinalizedEvent(
          assessmentId.value,
          new AssessmentFinalizedEvent.Payload(
            assessmentId.value,
            assessment.studentId,
            assessment.scorePercent ?? 0,
            null,
          ),
          correlationId,
        ),
      );
    }

    return assessment;
  }

  public static reconstitute(props: AssessmentProps): Assessment {
    return new Assessment(props);
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get lessonId(): string {
    return this._lessonId;
  }

  public get boardId(): string {
    return this._boardId;
  }

  public get studentId(): string {
    return this._studentId;
  }

  public get status(): AssessmentStatus {
    return this._status;
  }

  public get totalMaxMarks(): number {
    return this._totalMaxMarks;
  }

  public get totalMarksAwarded(): number | null {
    return this._totalMarksAwarded;
  }

  public get scorePercent(): number | null {
    return this._scorePercent;
  }

  public get autoMarkedCount(): number {
    return this._autoMarkedCount;
  }

  public get teacherMarkedCount(): number {
    return this._teacherMarkedCount;
  }

  public get pendingMarkCount(): number {
    return this._pendingMarkCount;
  }

  public get markingItems(): MarkingItem[] {
    return [...this._markingItems];
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public applyTeacherMark(
    markingItemId: string,
    marks: number,
    teacherId: string,
    feedback?: string | null,
    correlationId = 'system',
  ): void {
    if (this._status === AssessmentStatus.fully_marked) {
      throw new AssessmentAlreadyFinalizedError(this.id.value);
    }

    const item = this._markingItems.find((i) => i.id.value === markingItemId);
    if (!item) {
      throw new MarkingItemNotFoundError(markingItemId);
    }

    const wasPending = item.status === MarkingStatus.pending;
    item.applyTeacherMark(marks, teacherId, feedback);

    if (wasPending) {
      this._pendingMarkCount = Math.max(0, this._pendingMarkCount - 1);
      this._teacherMarkedCount++;
    }

    this.touch();
    this.addDomainEvent(
      new AssessmentMarkAppliedEvent(
        this.id.value,
        new AssessmentMarkAppliedEvent.Payload(
          this.id.value,
          markingItemId,
          marks,
        ),
        correlationId,
      ),
    );

    if (this._pendingMarkCount === 0) {
      this.finalizeMarking(null, correlationId);
    } else {
      this._status = AssessmentStatus.partially_marked;
    }
  }

  public finalizeMarking(
    curriculumNodeId?: string | null,
    correlationId = 'system',
  ): void {
    if (this._pendingMarkCount > 0) {
      throw new BusinessRuleViolationError(
        `Cannot finalize assessment with ${this._pendingMarkCount} pending marking items.`,
      );
    }

    let totalAwarded = 0;
    for (const item of this._markingItems) {
      totalAwarded += item.marksAwarded ?? 0;
    }

    this._totalMarksAwarded = totalAwarded;
    this._scorePercent =
      this._totalMaxMarks > 0
        ? (totalAwarded / this._totalMaxMarks) * 100
        : 100;
    this._status = AssessmentStatus.fully_marked;
    this.touch();

    this.addDomainEvent(
      new AssessmentFinalizedEvent(
        this.id.value,
        new AssessmentFinalizedEvent.Payload(
          this.id.value,
          this._studentId,
          this._scorePercent,
          curriculumNodeId ?? null,
        ),
        correlationId,
      ),
    );
  }
}
