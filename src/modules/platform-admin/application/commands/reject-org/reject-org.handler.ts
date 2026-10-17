import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectOrgCommand } from './reject-org.command';
import {
  IPlatformAdminRepository,
  IOrgApprovalRecordRepository,
  OrgApprovalRecord,
  ApprovalDecision,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface RejectOrgResult {
  id: string;
  orgId: string;
  decision: string;
  reason: string;
}

@CommandHandler(RejectOrgCommand)
export class RejectOrgHandler
  implements ICommandHandler<RejectOrgCommand, RejectOrgResult>
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly approvalRepository: IOrgApprovalRecordRepository,
  ) {}

  async execute(command: RejectOrgCommand): Promise<RejectOrgResult> {
    const reviewer = await this.adminRepository.findByUserId(command.reviewerUserId);
    if (!reviewer || !reviewer.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can reject organizations.',
      );
    }

    const record = OrgApprovalRecord.create({
      orgId: command.orgId,
      reviewedBy: command.reviewerUserId,
      decision: ApprovalDecision.rejected,
      reason: command.reason,
      correlationId: command.correlationId,
    });

    await this.approvalRepository.save(record);

    return {
      id: record.id.toString(),
      orgId: record.orgId,
      decision: record.decision,
      reason: command.reason,
    };
  }
}
