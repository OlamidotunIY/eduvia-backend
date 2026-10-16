import { AggregateRoot } from '@modules/shared';
import { ClassroomId } from '../value-objects/classroom-id.vo';
import { ClassroomStatus } from '../value-objects/classroom-status.vo';
import { RecurrencePattern } from '../value-objects/recurrence-pattern.vo';
import { ClassroomCreatedEvent } from '../events/classroom-created.event';
import { ClassroomPausedEvent } from '../events/classroom-paused.event';
import { ClassroomClosedEvent } from '../events/classroom-closed.event';
import { ClassroomTeacherChangedEvent } from '../events/classroom-teacher-changed.event';
import { ClassroomRecurrenceUpdatedEvent } from '../events/classroom-recurrence-updated.event';
import { ClassroomInvariantError } from '../errors/classroom-invariant.error';

export interface ClassroomCreateProps {
  id?: ClassroomId;
  orgId: string;
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  lessonDurationMins: number;
  maxStudents?: number;
  recurrence: RecurrencePattern;
  correlationId?: string;
}

export interface ClassroomReconstituteProps {
  id: ClassroomId;
  orgId: string;
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  status: ClassroomStatus;
  lessonDurationMins: number;
  maxStudents: number;
  recurrence: RecurrencePattern;
  createdAt: Date;
  updatedAt: Date;
}

export class Classroom extends AggregateRoot<ClassroomId> {
  public readonly orgId: string;
  private _name: string;
  private _subjectId: string;
  private _primaryTeacherId: string;
  private _status: ClassroomStatus;
  private _lessonDurationMins: number;
  private _maxStudents: number;
  private _recurrence: RecurrencePattern;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: ClassroomId;
    orgId: string;
    name: string;
    subjectId: string;
    primaryTeacherId: string;
    status: ClassroomStatus;
    lessonDurationMins: number;
    maxStudents: number;
    recurrence: RecurrencePattern;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(props.id);
    this.orgId = props.orgId;
    this._name = props.name;
    this._subjectId = props.subjectId;
    this._primaryTeacherId = props.primaryTeacherId;
    this._status = props.status;
    this._lessonDurationMins = props.lessonDurationMins;
    this._maxStudents = props.maxStudents;
    this._recurrence = props.recurrence;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: ClassroomCreateProps): Classroom {
    if (!props.name || props.name.trim().length === 0) {
      throw new ClassroomInvariantError('Classroom name is required');
    }
    if (!props.orgId) {
      throw new ClassroomInvariantError('Organization ID is required');
    }
    if (!props.subjectId) {
      throw new ClassroomInvariantError('Subject ID is required');
    }
    if (!props.primaryTeacherId) {
      throw new ClassroomInvariantError('Primary teacher ID is required');
    }
    if (!props.lessonDurationMins || props.lessonDurationMins <= 0) {
      throw new ClassroomInvariantError('Lesson duration must be greater than 0 minutes');
    }
    if (props.maxStudents !== undefined && props.maxStudents <= 0) {
      throw new ClassroomInvariantError('Max students must be at least 1');
    }

    const id = props.id ?? ClassroomId.create();
    const now = new Date();
    const classroom = new Classroom({
      id,
      orgId: props.orgId,
      name: props.name.trim(),
      subjectId: props.subjectId,
      primaryTeacherId: props.primaryTeacherId,
      status: ClassroomStatus.ACTIVE,
      lessonDurationMins: props.lessonDurationMins,
      maxStudents: props.maxStudents ?? 1,
      recurrence: props.recurrence,
      createdAt: now,
      updatedAt: now,
    });

    classroom.addDomainEvent(
      new ClassroomCreatedEvent(
        id.value,
        new ClassroomCreatedEvent.Payload(
          id.value,
          props.orgId,
          props.primaryTeacherId,
          props.subjectId,
        ),
        props.correlationId ?? id.value,
      ),
    );

    return classroom;
  }

  public static reconstitute(props: ClassroomReconstituteProps): Classroom {
    return new Classroom(props);
  }

  public pause(correlationId?: string): void {
    if (this._status === ClassroomStatus.CLOSED) {
      throw new ClassroomInvariantError('Cannot pause a closed classroom');
    }
    if (this._status === ClassroomStatus.PAUSED) {
      return;
    }
    this._status = ClassroomStatus.PAUSED;
    this.touch();

    this.addDomainEvent(
      new ClassroomPausedEvent(
        this.id.value,
        new ClassroomPausedEvent.Payload(this.id.value, this.orgId),
        correlationId ?? this.id.value,
      ),
    );
  }

  public reopen(): void {
    if (this._status === ClassroomStatus.CLOSED) {
      throw new ClassroomInvariantError('Cannot reopen a closed classroom');
    }
    this._status = ClassroomStatus.ACTIVE;
    this.touch();
  }

  public close(correlationId?: string): void {
    if (this._status === ClassroomStatus.CLOSED) {
      return;
    }
    this._status = ClassroomStatus.CLOSED;
    this.touch();

    this.addDomainEvent(
      new ClassroomClosedEvent(
        this.id.value,
        new ClassroomClosedEvent.Payload(this.id.value, this.orgId),
        correlationId ?? this.id.value,
      ),
    );
  }

  public changeTeacher(newTeacherId: string, correlationId?: string): void {
    if (!newTeacherId) {
      throw new ClassroomInvariantError('New teacher ID is required');
    }
    if (this._primaryTeacherId === newTeacherId) {
      return;
    }
    const oldTeacherId = this._primaryTeacherId;
    this._primaryTeacherId = newTeacherId;
    this.touch();

    this.addDomainEvent(
      new ClassroomTeacherChangedEvent(
        this.id.value,
        new ClassroomTeacherChangedEvent.Payload(
          this.id.value,
          this.orgId,
          oldTeacherId,
          newTeacherId,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public updateRecurrence(pattern: RecurrencePattern, correlationId?: string): void {
    this._recurrence = pattern;
    this.touch();

    this.addDomainEvent(
      new ClassroomRecurrenceUpdatedEvent(
        this.id.value,
        new ClassroomRecurrenceUpdatedEvent.Payload(this.id.value, this.orgId),
        correlationId ?? this.id.value,
      ),
    );
  }

  public update(props: { name?: string; lessonDurationMins?: number; maxStudents?: number }): void {
    let modified = false;
    if (props.name !== undefined && props.name.trim().length > 0) {
      this._name = props.name.trim();
      modified = true;
    }
    if (props.lessonDurationMins !== undefined && props.lessonDurationMins > 0) {
      this._lessonDurationMins = props.lessonDurationMins;
      modified = true;
    }
    if (props.maxStudents !== undefined && props.maxStudents > 0) {
      this._maxStudents = props.maxStudents;
      modified = true;
    }
    if (modified) {
      this.touch();
    }
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Getters
  public get name(): string {
    return this._name;
  }

  public get subjectId(): string {
    return this._subjectId;
  }

  public get primaryTeacherId(): string {
    return this._primaryTeacherId;
  }

  public get status(): ClassroomStatus {
    return this._status;
  }

  public get lessonDurationMins(): number {
    return this._lessonDurationMins;
  }

  public get maxStudents(): number {
    return this._maxStudents;
  }

  public get recurrence(): RecurrencePattern {
    return this._recurrence;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
