import { AggregateRoot } from '@modules/shared';
import { LessonId } from '../value-objects/lesson-id.vo';
import { LessonStatus } from '../value-objects/lesson-status.vo';
import { VideoProvider } from '../value-objects/video-provider.vo';
import { NoShowType } from '../value-objects/no-show-type.vo';
import { LessonCreatedEvent } from '../events/lesson-created.event';
import { LessonScheduledEvent } from '../events/lesson-scheduled.event';
import { LessonStartedEvent } from '../events/lesson-started.event';
import { LessonCompletedEvent } from '../events/lesson-completed.event';
import { LessonReportedEvent } from '../events/lesson-reported.event';
import { LessonArchivedEvent } from '../events/lesson-archived.event';
import { LessonCancelledEvent } from '../events/lesson-cancelled.event';
import { LessonStudentNoShowEvent } from '../events/lesson-student-no-show.event';
import { LessonTeacherNoShowEvent } from '../events/lesson-teacher-no-show.event';
import { CoverTeacherAssignedEvent } from '../events/cover-teacher-assigned.event';
import { InvalidLessonStateError } from '../errors/invalid-lesson-state.error';
import { LessonArchivedError } from '../errors/lesson-archived.error';
import { ClassroomInvariantError } from '../errors/classroom-invariant.error';

export interface LessonCreateProps {
  id?: LessonId;
  orgId: string;
  classroomId: string;
  teacherId: string;
  scheduledAt: Date;
  durationMins: number;
  isRecurring?: boolean;
  correlationId?: string;
}

export interface LessonReconstituteProps {
  id: LessonId;
  orgId: string;
  classroomId: string;
  teacherId: string;
  coverTeacherId: string | null;
  scheduledAt: Date;
  durationMins: number;
  status: LessonStatus;
  meetingId: string | null;
  videoProvider: VideoProvider | null;
  meetLink: string | null;
  cancelledReason: string | null;
  cancelledBy: string | null;
  noShowAt: Date | null;
  noShowType: NoShowType | null;
  startedAt: Date | null;
  completedAt: Date | null;
  markedAt: Date | null;
  reportedAt: Date | null;
  archivedAt: Date | null;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Lesson extends AggregateRoot<LessonId> {
  public readonly orgId: string;
  public readonly classroomId: string;
  public readonly teacherId: string;
  private _coverTeacherId: string | null;
  private _scheduledAt: Date;
  private _durationMins: number;
  private _status: LessonStatus;
  private _meetingId: string | null;
  private _videoProvider: VideoProvider | null;
  private _meetLink: string | null;
  private _cancelledReason: string | null;
  private _cancelledBy: string | null;
  private _noShowAt: Date | null;
  private _noShowType: NoShowType | null;
  private _startedAt: Date | null;
  private _completedAt: Date | null;
  private _markedAt: Date | null;
  private _reportedAt: Date | null;
  private _archivedAt: Date | null;
  public readonly isRecurring: boolean;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: LessonReconstituteProps) {
    super(props.id);
    this.orgId = props.orgId;
    this.classroomId = props.classroomId;
    this.teacherId = props.teacherId;
    this._coverTeacherId = props.coverTeacherId;
    this._scheduledAt = props.scheduledAt;
    this._durationMins = props.durationMins;
    this._status = props.status;
    this._meetingId = props.meetingId;
    this._videoProvider = props.videoProvider;
    this._meetLink = props.meetLink;
    this._cancelledReason = props.cancelledReason;
    this._cancelledBy = props.cancelledBy;
    this._noShowAt = props.noShowAt;
    this._noShowType = props.noShowType;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._markedAt = props.markedAt;
    this._reportedAt = props.reportedAt;
    this._archivedAt = props.archivedAt;
    this.isRecurring = props.isRecurring;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: LessonCreateProps): Lesson {
    if (!props.orgId) throw new ClassroomInvariantError('Org ID is required');
    if (!props.classroomId) throw new ClassroomInvariantError('Classroom ID is required');
    if (!props.teacherId) throw new ClassroomInvariantError('Teacher ID is required');
    if (!props.scheduledAt) throw new ClassroomInvariantError('Scheduled date is required');
    if (!props.durationMins || props.durationMins <= 0) {
      throw new ClassroomInvariantError('Duration must be greater than 0 minutes');
    }

    const id = props.id ?? LessonId.create();
    const now = new Date();
    const lesson = new Lesson({
      id,
      orgId: props.orgId,
      classroomId: props.classroomId,
      teacherId: props.teacherId,
      coverTeacherId: null,
      scheduledAt: props.scheduledAt,
      durationMins: props.durationMins,
      status: LessonStatus.PENDING,
      meetingId: null,
      videoProvider: null,
      meetLink: null,
      cancelledReason: null,
      cancelledBy: null,
      noShowAt: null,
      noShowType: null,
      startedAt: null,
      completedAt: null,
      markedAt: null,
      reportedAt: null,
      archivedAt: null,
      isRecurring: props.isRecurring ?? true,
      createdAt: now,
      updatedAt: now,
    });

    lesson.addDomainEvent(
      new LessonCreatedEvent(
        id.value,
        new LessonCreatedEvent.Payload(
          id.value,
          props.classroomId,
          props.orgId,
          props.scheduledAt,
        ),
        props.correlationId ?? id.value,
      ),
    );

    return lesson;
  }

  public static reconstitute(props: LessonReconstituteProps): Lesson {
    return new Lesson(props);
  }

  private ensureNotArchived(): void {
    if (this._status === LessonStatus.ARCHIVED) {
      throw new LessonArchivedError();
    }
  }

  public schedule(correlationId?: string): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.PENDING) {
      throw new InvalidLessonStateError(`Cannot schedule lesson from status ${this._status}`);
    }
    this._status = LessonStatus.SCHEDULED;
    this.touch();

    const activeTeacher = this._coverTeacherId ?? this.teacherId;
    this.addDomainEvent(
      new LessonScheduledEvent(
        this.id.value,
        new LessonScheduledEvent.Payload(
          this.id.value,
          this.orgId,
          this._scheduledAt,
          activeTeacher,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public attachMeeting(meetingId: string, videoProvider: VideoProvider, meetLink: string): void {
    this.ensureNotArchived();
    this._meetingId = meetingId;
    this._videoProvider = videoProvider;
    this._meetLink = meetLink;
    this.touch();
  }

  public start(correlationId?: string): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.SCHEDULED) {
      throw new InvalidLessonStateError(`Lesson must be SCHEDULED to go LIVE. Current status: ${this._status}`);
    }
    this._status = LessonStatus.LIVE;
    this._startedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new LessonStartedEvent(
        this.id.value,
        new LessonStartedEvent.Payload(this.id.value, this.orgId, this._meetLink),
        correlationId ?? this.id.value,
      ),
    );
  }

  public complete(correlationId?: string): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.LIVE) {
      throw new InvalidLessonStateError(`Lesson must be LIVE to complete. Current status: ${this._status}`);
    }
    this._status = LessonStatus.COMPLETED;
    this._completedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new LessonCompletedEvent(
        this.id.value,
        new LessonCompletedEvent.Payload(this.id.value, this.orgId, this._completedAt),
        correlationId ?? this.id.value,
      ),
    );
  }

  public beginMarking(): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.COMPLETED) {
      throw new InvalidLessonStateError(`Lesson must be COMPLETED to begin marking. Current status: ${this._status}`);
    }
    this._status = LessonStatus.MARKING;
    this._markedAt = new Date();
    this.touch();
  }

  public markReported(correlationId?: string): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.MARKING) {
      throw new InvalidLessonStateError(`Lesson must be in MARKING state to report. Current status: ${this._status}`);
    }
    this._status = LessonStatus.REPORTED;
    this._reportedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new LessonReportedEvent(
        this.id.value,
        new LessonReportedEvent.Payload(this.id.value, this.orgId, this._reportedAt),
        correlationId ?? this.id.value,
      ),
    );
  }

  public archive(correlationId?: string): void {
    if (this._status === LessonStatus.ARCHIVED) {
      return;
    }
    if (this._status !== LessonStatus.REPORTED) {
      throw new InvalidLessonStateError(`Only REPORTED lessons can be archived. Current status: ${this._status}`);
    }
    this._status = LessonStatus.ARCHIVED;
    this._archivedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new LessonArchivedEvent(
        this.id.value,
        new LessonArchivedEvent.Payload(this.id.value, this.orgId),
        correlationId ?? this.id.value,
      ),
    );
  }

  public cancel(reason: string, cancelledBy: string, correlationId?: string): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.PENDING && this._status !== LessonStatus.SCHEDULED) {
      throw new InvalidLessonStateError(`A lesson can only be cancelled from PENDING or SCHEDULED. Current status: ${this._status}`);
    }
    this._status = LessonStatus.CANCELLED;
    this._cancelledReason = reason;
    this._cancelledBy = cancelledBy;
    this.touch();

    this.addDomainEvent(
      new LessonCancelledEvent(
        this.id.value,
        new LessonCancelledEvent.Payload(this.id.value, this.orgId, reason, cancelledBy),
        correlationId ?? this.id.value,
      ),
    );
  }

  public markStudentNoShow(correlationId?: string): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.LIVE) {
      throw new InvalidLessonStateError(`Student no-show can only be marked from LIVE. Current status: ${this._status}`);
    }
    this._status = LessonStatus.STUDENT_NO_SHOW;
    this._noShowAt = new Date();
    this._noShowType = NoShowType.STUDENT;
    this.touch();

    this.addDomainEvent(
      new LessonStudentNoShowEvent(
        this.id.value,
        new LessonStudentNoShowEvent.Payload(this.id.value, this.orgId, this._noShowAt),
        correlationId ?? this.id.value,
      ),
    );
  }

  public markTeacherNoShow(markedBy: string, correlationId?: string): void {
    this.ensureNotArchived();
    if (this._status !== LessonStatus.SCHEDULED) {
      throw new InvalidLessonStateError(`Teacher no-show can only be marked from SCHEDULED. Current status: ${this._status}`);
    }
    this._status = LessonStatus.TEACHER_NO_SHOW;
    this._noShowAt = new Date();
    this._noShowType = NoShowType.TEACHER;
    this.touch();

    this.addDomainEvent(
      new LessonTeacherNoShowEvent(
        this.id.value,
        new LessonTeacherNoShowEvent.Payload(this.id.value, this.orgId, this._noShowAt, markedBy),
        correlationId ?? this.id.value,
      ),
    );
  }

  public assignCoverTeacher(teacherId: string, correlationId?: string): void {
    this.ensureNotArchived();
    if (!teacherId) {
      throw new ClassroomInvariantError('Cover teacher ID is required');
    }
    this._coverTeacherId = teacherId;
    this.touch();

    this.addDomainEvent(
      new CoverTeacherAssignedEvent(
        this.id.value,
        new CoverTeacherAssignedEvent.Payload(this.id.value, teacherId, this.orgId),
        correlationId ?? this.id.value,
      ),
    );
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Getters
  public get coverTeacherId(): string | null {
    return this._coverTeacherId;
  }

  public get scheduledAt(): Date {
    return this._scheduledAt;
  }

  public get durationMins(): number {
    return this._durationMins;
  }

  public get status(): LessonStatus {
    return this._status;
  }

  public get meetingId(): string | null {
    return this._meetingId;
  }

  public get videoProvider(): VideoProvider | null {
    return this._videoProvider;
  }

  public get meetLink(): string | null {
    return this._meetLink;
  }

  public get cancelledReason(): string | null {
    return this._cancelledReason;
  }

  public get cancelledBy(): string | null {
    return this._cancelledBy;
  }

  public get noShowAt(): Date | null {
    return this._noShowAt;
  }

  public get noShowType(): NoShowType | null {
    return this._noShowType;
  }

  public get startedAt(): Date | null {
    return this._startedAt;
  }

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public get markedAt(): Date | null {
    return this._markedAt;
  }

  public get reportedAt(): Date | null {
    return this._reportedAt;
  }

  public get archivedAt(): Date | null {
    return this._archivedAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
