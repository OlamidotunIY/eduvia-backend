import { ApprovalDecision } from '../../../domain';

export interface OrgApprovalRecordDto {
  id: string;
  orgId: string;
  reviewedBy: string;
  decision: ApprovalDecision;
  reason: string | null;
  reviewedAt: Date;
  createdAt: Date;
}
