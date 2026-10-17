import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import { OrgApprovalRecordId, ApprovalDecision } from '../value-objects';
import {
  OrgApprovedEvent,
  OrgRejectedEvent,
  OrgSuspendedEvent,
  OrgReactivatedEvent,
} from '../events';

export interface OrgApprovalRecordProps {
  id: OrgApprovalRecordId;
  orgId: string;
  reviewedBy: string;
  decision: ApprovalDecision;
  reason: string | null;
  reviewedAt: Date;
  createdAt: Date;
}

export class OrgApprovalRecord extends AggregateRoot<OrgApprovalRecordId> {
  private _orgId: string;
  private _reviewedBy: string;
  private _decision: ApprovalDecision;
  private _reason: string | null;
  private _reviewedAt: Date;
  private _createdAt: Date;

  protected constructor(props: OrgApprovalRecordProps) {
    super(props.id);
    this._orgId = props.orgId;
    this._reviewedBy = props.reviewedBy;
    this._decision = props.decision;
    this._reason = props.reason;
    this._reviewedAt = new Date(props.reviewedAt);
    this._createdAt = new Date(props.createdAt);
  }

  public static create(props: {
    id?: OrgApprovalRecordId;
    orgId: string;
    reviewedBy: string;
    decision: ApprovalDecision;
    reason?: string | null;
    reviewedAt?: Date;
    correlationId?: string;
  }): OrgApprovalRecord {
    if (!props.orgId) {
      throw new BusinessRuleViolationError('Organization ID is required for approval record.');
    }
    if (!props.reviewedBy) {
      throw new BusinessRuleViolationError('Reviewer user ID is required for approval record.');
    }
    if (props.decision === ApprovalDecision.rejected && !props.reason) {
      throw new BusinessRuleViolationError('Rejection reason must be provided when rejecting an organization.');
    }
    if (props.decision === ApprovalDecision.suspended && !props.reason) {
      throw new BusinessRuleViolationError('Suspension reason must be provided when suspending an organization.');
    }

    const now = new Date();
    const record = new OrgApprovalRecord({
      id: props.id ?? OrgApprovalRecordId.create(),
      orgId: props.orgId,
      reviewedBy: props.reviewedBy,
      decision: props.decision,
      reason: props.reason ?? null,
      reviewedAt: props.reviewedAt ?? now,
      createdAt: now,
    });

    const correlationId = props.correlationId ?? props.orgId;

    if (props.decision === ApprovalDecision.approved) {
      record.addDomainEvent(
        new OrgApprovedEvent(
          record.id.toString(),
          new OrgApprovedEvent.Payload(props.orgId, props.reviewedBy, record.reviewedAt),
          correlationId,
        ),
      );
    } else if (props.decision === ApprovalDecision.rejected) {
      record.addDomainEvent(
        new OrgRejectedEvent(
          record.id.toString(),
          new OrgRejectedEvent.Payload(props.orgId, props.reviewedBy, props.reason ?? undefined),
          correlationId,
        ),
      );
    } else if (props.decision === ApprovalDecision.suspended) {
      record.addDomainEvent(
        new OrgSuspendedEvent(
          record.id.toString(),
          new OrgSuspendedEvent.Payload(props.orgId, props.reviewedBy, props.reason ?? undefined),
          correlationId,
        ),
      );
    } else if (props.decision === ApprovalDecision.reactivated) {
      record.addDomainEvent(
        new OrgReactivatedEvent(
          record.id.toString(),
          new OrgReactivatedEvent.Payload(props.orgId, props.reviewedBy),
          correlationId,
        ),
      );
    }

    return record;
  }

  public static reconstitute(props: OrgApprovalRecordProps): OrgApprovalRecord {
    return new OrgApprovalRecord(props);
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get reviewedBy(): string {
    return this._reviewedBy;
  }

  public get decision(): ApprovalDecision {
    return this._decision;
  }

  public get reason(): string | null {
    return this._reason;
  }

  public get reviewedAt(): Date {
    return new Date(this._reviewedAt);
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }
}
