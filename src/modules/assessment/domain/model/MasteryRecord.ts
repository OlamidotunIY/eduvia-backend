import { AggregateRoot } from '@modules/shared';
import {
  MasteryRecordId,
  MasteryTrigger,
} from '../value-objects';
import { MasteryHistoryEntry } from '../entities/mastery-history-entry.entity';
import {
  MasteryRecordCreatedEvent,
  MasteryUpdatedEvent,
} from '../events';
import { InvalidMarkRangeError } from '../errors';

export interface MasteryRecordProps {
  id: MasteryRecordId;
  studentId: string;
  curriculumNodeId: string;
  orgId: string;
  masteryLevel: number;
  teacherAssessedScore?: number | null;
  systemCalculatedScore?: number | null;
  assessmentCount: number;
  lastUpdatedAt: Date;
  history?: MasteryHistoryEntry[];
}

export class MasteryRecord extends AggregateRoot<MasteryRecordId> {
  private _studentId: string;
  private _curriculumNodeId: string;
  private _orgId: string;
  private _masteryLevel: number;
  private _teacherAssessedScore: number | null;
  private _systemCalculatedScore: number | null;
  private _assessmentCount: number;
  private _lastUpdatedAt: Date;
  private _history: MasteryHistoryEntry[];

  protected constructor(props: MasteryRecordProps) {
    super(props.id);
    this._studentId = props.studentId;
    this._curriculumNodeId = props.curriculumNodeId;
    this._orgId = props.orgId;
    this._masteryLevel = Math.min(1.0, Math.max(0.0, props.masteryLevel));
    this._teacherAssessedScore =
      props.teacherAssessedScore !== undefined &&
      props.teacherAssessedScore !== null
        ? Math.min(1.0, Math.max(0.0, props.teacherAssessedScore))
        : null;
    this._systemCalculatedScore =
      props.systemCalculatedScore !== undefined &&
      props.systemCalculatedScore !== null
        ? Math.min(1.0, Math.max(0.0, props.systemCalculatedScore))
        : null;
    this._assessmentCount = props.assessmentCount;
    this._lastUpdatedAt = new Date(props.lastUpdatedAt);
    this._history = props.history ? [...props.history] : [];
  }

  public static create(
    props: {
      id?: MasteryRecordId;
      studentId: string;
      curriculumNodeId: string;
      orgId: string;
      initialMasteryLevel?: number;
    },
    correlationId = 'system',
  ): MasteryRecord {
    const recordId = props.id ?? MasteryRecordId.create();
    const initialLevel = props.initialMasteryLevel ?? 0.0;
    const now = new Date();

    const record = new MasteryRecord({
      id: recordId,
      studentId: props.studentId,
      curriculumNodeId: props.curriculumNodeId,
      orgId: props.orgId,
      masteryLevel: initialLevel,
      teacherAssessedScore: null,
      systemCalculatedScore: null,
      assessmentCount: 0,
      lastUpdatedAt: now,
      history: [],
    });

    record.addDomainEvent(
      new MasteryRecordCreatedEvent(
        recordId.value,
        new MasteryRecordCreatedEvent.Payload(
          recordId.value,
          record.studentId,
          record.curriculumNodeId,
          record.orgId,
        ),
        correlationId,
      ),
    );

    return record;
  }

  public static reconstitute(props: MasteryRecordProps): MasteryRecord {
    return new MasteryRecord(props);
  }

  public get studentId(): string {
    return this._studentId;
  }

  public get curriculumNodeId(): string {
    return this._curriculumNodeId;
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get masteryLevel(): number {
    return this._masteryLevel;
  }

  public get teacherAssessedScore(): number | null {
    return this._teacherAssessedScore;
  }

  public get systemCalculatedScore(): number | null {
    return this._systemCalculatedScore;
  }

  public get assessmentCount(): number {
    return this._assessmentCount;
  }

  public get lastUpdatedAt(): Date {
    return new Date(this._lastUpdatedAt);
  }

  public get history(): MasteryHistoryEntry[] {
    return [...this._history];
  }

  public updateFromAssessment(
    scorePercent: number,
    lessonId?: string | null,
    correlationId = 'system',
  ): void {
    const normalizedScore = Math.min(1.0, Math.max(0.0, scorePercent / 100));
    this._assessmentCount++;

    if (this._systemCalculatedScore === null) {
      this._systemCalculatedScore = normalizedScore;
    } else {
      const window = Math.min(this._assessmentCount, 5);
      this._systemCalculatedScore =
        (this._systemCalculatedScore * (window - 1) + normalizedScore) / window;
    }

    if (this._teacherAssessedScore !== null) {
      this._masteryLevel = Math.min(
        1.0,
        Math.max(
          0.0,
          0.6 * this._systemCalculatedScore + 0.4 * this._teacherAssessedScore,
        ),
      );
    } else {
      this._masteryLevel = Math.min(
        1.0,
        Math.max(0.0, this._systemCalculatedScore),
      );
    }

    const now = new Date();
    this._lastUpdatedAt = now;

    const entry = MasteryHistoryEntry.create({
      masteryRecordId: this.id.value,
      masteryLevel: this._masteryLevel,
      trigger: MasteryTrigger.assessment,
      lessonId: lessonId ?? null,
      recordedAt: now,
    });
    this._history.push(entry);

    this.addDomainEvent(
      new MasteryUpdatedEvent(
        this.id.value,
        new MasteryUpdatedEvent.Payload(
          this.id.value,
          this._studentId,
          this._curriculumNodeId,
          this._masteryLevel,
        ),
        correlationId,
      ),
    );
  }

  public applyTeacherAssessment(
    score: number,
    correlationId = 'system',
  ): void {
    if (score < 0 || score > 1.0) {
      throw new InvalidMarkRangeError(
        `Teacher assessed mastery score (${score}) must be between 0.0 and 1.0.`,
      );
    }

    this._teacherAssessedScore = score;

    if (this._systemCalculatedScore !== null) {
      this._masteryLevel = Math.min(
        1.0,
        Math.max(
          0.0,
          0.6 * this._systemCalculatedScore + 0.4 * this._teacherAssessedScore,
        ),
      );
    } else {
      this._masteryLevel = score;
    }

    const now = new Date();
    this._lastUpdatedAt = now;

    const entry = MasteryHistoryEntry.create({
      masteryRecordId: this.id.value,
      masteryLevel: this._masteryLevel,
      trigger: MasteryTrigger.teacher_override,
      recordedAt: now,
    });
    this._history.push(entry);

    this.addDomainEvent(
      new MasteryUpdatedEvent(
        this.id.value,
        new MasteryUpdatedEvent.Payload(
          this.id.value,
          this._studentId,
          this._curriculumNodeId,
          this._masteryLevel,
        ),
        correlationId,
      ),
    );
  }
}
