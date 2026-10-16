import { AggregateRoot } from '@modules/shared';
import { StudentEnrollmentId } from '../value-objects/student-enrollment-id.vo';
import { EnrollmentStatus } from '../value-objects/enrollment-status.vo';
import { StudentEnrolledInClassroomEvent } from '../events/student-enrolled.event';
import { StudentRemovedFromClassroomEvent } from '../events/student-removed.event';
import { ClassroomInvariantError } from '../errors/classroom-invariant.error';

export interface StudentEnrollmentCreateProps {
  id?: StudentEnrollmentId;
  classroomId: string;
  studentId: string;
  orgId: string;
  correlationId?: string;
}

export interface StudentEnrollmentReconstituteProps {
  id: StudentEnrollmentId;
  classroomId: string;
  studentId: string;
  orgId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  removedAt: Date | null;
}

export class StudentEnrollment extends AggregateRoot<StudentEnrollmentId> {
  public readonly classroomId: string;
  public readonly studentId: string;
  public readonly orgId: string;
  private _status: EnrollmentStatus;
  public readonly enrolledAt: Date;
  private _removedAt: Date | null;

  private constructor(props: {
    id: StudentEnrollmentId;
    classroomId: string;
    studentId: string;
    orgId: string;
    status: EnrollmentStatus;
    enrolledAt: Date;
    removedAt: Date | null;
  }) {
    super(props.id);
    this.classroomId = props.classroomId;
    this.studentId = props.studentId;
    this.orgId = props.orgId;
    this._status = props.status;
    this.enrolledAt = props.enrolledAt;
    this._removedAt = props.removedAt;
  }

  public static create(props: StudentEnrollmentCreateProps): StudentEnrollment {
    if (!props.classroomId) {
      throw new ClassroomInvariantError('Classroom ID is required for enrollment');
    }
    if (!props.studentId) {
      throw new ClassroomInvariantError('Student ID is required for enrollment');
    }
    if (!props.orgId) {
      throw new ClassroomInvariantError('Organization ID is required for enrollment');
    }

    const id = props.id ?? StudentEnrollmentId.create();
    const now = new Date();
    const enrollment = new StudentEnrollment({
      id,
      classroomId: props.classroomId,
      studentId: props.studentId,
      orgId: props.orgId,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: now,
      removedAt: null,
    });

    enrollment.addDomainEvent(
      new StudentEnrolledInClassroomEvent(
        id.value,
        new StudentEnrolledInClassroomEvent.Payload(
          props.classroomId,
          props.studentId,
          props.orgId,
        ),
        props.correlationId ?? id.value,
      ),
    );

    return enrollment;
  }

  public static reconstitute(props: StudentEnrollmentReconstituteProps): StudentEnrollment {
    return new StudentEnrollment(props);
  }

  public pause(): void {
    if (this._status === EnrollmentStatus.REMOVED) {
      throw new ClassroomInvariantError('Cannot pause a removed enrollment');
    }
    this._status = EnrollmentStatus.PAUSED;
  }

  public resume(): void {
    if (this._status === EnrollmentStatus.REMOVED) {
      throw new ClassroomInvariantError('Cannot resume a removed enrollment');
    }
    this._status = EnrollmentStatus.ACTIVE;
  }

  public remove(correlationId?: string): void {
    if (this._status === EnrollmentStatus.REMOVED) {
      return;
    }
    this._status = EnrollmentStatus.REMOVED;
    this._removedAt = new Date();

    this.addDomainEvent(
      new StudentRemovedFromClassroomEvent(
        this.id.value,
        new StudentRemovedFromClassroomEvent.Payload(
          this.classroomId,
          this.studentId,
          this.orgId,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  // Getters
  public get status(): EnrollmentStatus {
    return this._status;
  }

  public get removedAt(): Date | null {
    return this._removedAt;
  }
}
