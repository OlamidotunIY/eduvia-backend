import { AggregateRoot } from '@modules/shared';
import { ApplicationStatus, TeacherApplicationId } from '../value-objects';
import { TeacherApplicationReceivedEvent } from '../events/teacher-application-received.event';
import { TeacherApplicationApprovedEvent } from '../events/teacher-application-approved.event';
import { TeacherApplicationRejectedEvent } from '../events/teacher-application-rejected.event';


class TeacherApplication extends AggregateRoot<TeacherApplicationId> {
  public readonly orgId: string;
  public readonly applicantUserId: string;
  public readonly appliedSubjects: string[];
  private _status: ApplicationStatus;
  private _rejectionReason: string | null;
  private _reviewedBy: string | null;
  private _reviewedAt: Date | null;
  public readonly coverLetter: string | null;
  public readonly qualifications: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: TeacherApplicationId;
    orgId: string;
    applicantUserId: string;
    appliedSubjects: string[];
    status: ApplicationStatus;
    rejectionReason: string | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    coverLetter: string | null;
    qualifications: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);

    this.orgId = params.orgId;
    this.applicantUserId = params.applicantUserId;
    this.appliedSubjects = params.appliedSubjects;
    this._status = params.status;
    this._rejectionReason = params.rejectionReason;
    this._reviewedBy = params.reviewedBy;
    this._reviewedAt = params.reviewedAt;
    this.coverLetter = params.coverLetter;
    this.qualifications = params.qualifications;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    orgId: string;
    applicantUserId: string;
    appliedSubjects: string[];
    coverLetter?: string | null;
    qualifications?: string | null;
    correlationId: string;
  }): TeacherApplication {
    const now = new Date();

    const application = new TeacherApplication({
      id: TeacherApplicationId.create(),
      orgId: params.orgId,
      applicantUserId: params.applicantUserId,
      appliedSubjects: params.appliedSubjects,
      status: ApplicationStatus.PENDING_REVIEW,
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
      coverLetter: params.coverLetter ?? null,
      qualifications: params.qualifications ?? null,
      createdAt: now,
      updatedAt: now,
    });

    application.addDomainEvent(
      new TeacherApplicationReceivedEvent(
        application.getId(),
        new TeacherApplicationReceivedEvent.Payload(
          application.getId(),
          application.orgId,
          application.applicantUserId,
          application.appliedSubjects,
        ),
        params.correlationId,
      ),
    );

    return application;
  }

  public static reconstitute(params: {
    id: TeacherApplicationId;
    orgId: string;
    applicantUserId: string;
    appliedSubjects: string[];
    status: ApplicationStatus;
    rejectionReason: string | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    coverLetter: string | null;
    qualifications: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TeacherApplication {
    return new TeacherApplication(params);
  }

  public approve(reviewerId: string, correlationId: string): void {
    if (this._status !== ApplicationStatus.PENDING_REVIEW) {
      throw new Error("Only a pending application can be review");
    }

    this._status = ApplicationStatus.APPROVED;
    this._reviewedBy = reviewerId;
    this._reviewedAt = new Date();
    this._updatedAt = new Date();

    this.addDomainEvent(
      new TeacherApplicationApprovedEvent(
        this.getId(),
        new TeacherApplicationApprovedEvent.Payload(
          this.getId(),
          this.orgId,
          this.applicantUserId,
          this.appliedSubjects,
        ),
        correlationId,
      ),
    );
  }

  public reject(reviewerId: string, reason: string | null, correlationId: string): void {

    this._status = ApplicationStatus.REJECTED;
    this._rejectionReason = reason;
    this._reviewedBy = reviewerId;
    this._reviewedAt = new Date();
    this._updatedAt = new Date();

    this.addDomainEvent(
      new TeacherApplicationRejectedEvent(
        this.getId(),
        new TeacherApplicationRejectedEvent.Payload(this.getId(), this.orgId, reason),
        correlationId,
      ),
    );
  }

  public get status(): ApplicationStatus {
    return this._status;
  }

  public get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  public get reviewedBy(): string | null {
    return this._reviewedBy;
  }

  public get reviewedAt(): Date | null {
    return this._reviewedAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt
  }
}

export { TeacherApplication };