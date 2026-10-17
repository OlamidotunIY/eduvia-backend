import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveOrgCommand } from './approve-org.command';
import {
  IPlatformAdminRepository,
  IOrgApprovalRecordRepository,
  OrgApprovalRecord,
  ApprovalDecision,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface ApproveOrgResult {
  id: string;
  orgId: string;
  decision: string;
}

@CommandHandler(ApproveOrgCommand)
export class ApproveOrgHandler
  implements ICommandHandler<ApproveOrgCommand, ApproveOrgResult>
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly approvalRepository: IOrgApprovalRecordRepository,
  ) {}

  async execute(command: ApproveOrgCommand): Promise<ApproveOrgResult> {
    const reviewer = await this.adminRepository.findByUserId(command.reviewerUserId);
    if (!reviewer || !reviewer.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can approve organizations.',
      );
    }

    const record = OrgApprovalRecord.create({
      orgId: command.orgId,
      reviewedBy: command.reviewerUserId,
      decision: ApprovalDecision.approved,
      reason: command.reason,
      correlationId: command.correlationId,
    });

    await this.approvalRepository.save(record);

    return {
      id: record.id.toString(),
      orgId: record.orgId,
      decision: record.decision,
    };
  }
}
