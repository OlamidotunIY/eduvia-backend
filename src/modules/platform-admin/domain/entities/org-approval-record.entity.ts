import { BusinessRuleViolationError } from '@modules/shared/domain';
import { OrgApprovalRecordId, ApprovalDecision } from '../value-objects';

export interface OrgApprovalRecordProps {
  id: OrgApprovalRecordId;
  orgId: string;
  reviewedBy: string;
  decision: ApprovalDecision;
  reason: string | null;
  reviewedAt: Date;
  createdAt: Date;
}

export class OrgApprovalRecord {
  private _id: OrgApprovalRecordId;
  private _orgId: string;
  private _reviewedBy: string;
  private _decision: ApprovalDecision;
  private _reason: string | null;
  private _reviewedAt: Date;
  private _createdAt: Date;

  protected constructor(props: OrgApprovalRecordProps) {
    this._id = props.id;
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

    const now = new Date();
    return new OrgApprovalRecord({
      id: props.id ?? OrgApprovalRecordId.create(),
      orgId: props.orgId,
      reviewedBy: props.reviewedBy,
      decision: props.decision,
      reason: props.reason ?? null,
      reviewedAt: props.reviewedAt ?? now,
      createdAt: now,
    });
  }

  public static reconstitute(props: OrgApprovalRecordProps): OrgApprovalRecord {
    return new OrgApprovalRecord(props);
  }

  public get id(): OrgApprovalRecordId {
    return this._id;
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
