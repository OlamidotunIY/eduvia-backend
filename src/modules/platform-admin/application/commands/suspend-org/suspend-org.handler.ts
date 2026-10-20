import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuspendOrgCommand } from './suspend-org.command';
import {
  IPlatformAdminRepository,
  IOrgApprovalRecordRepository,
  OrgApprovalRecord,
  ApprovalDecision,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface SuspendOrgResult {
  id: string;
  orgId: string;
  decision: string;
  reason: string;
}

@CommandHandler(SuspendOrgCommand)
export class SuspendOrgHandler
  implements ICommandHandler<SuspendOrgCommand, SuspendOrgResult>
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly approvalRepository: IOrgApprovalRecordRepository,
  ) {}

  async execute(command: SuspendOrgCommand): Promise<SuspendOrgResult> {
    const admin = await this.adminRepository.findByUserId(command.adminUserId);
    if (!admin || !admin.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can suspend organizations.',
      );
    }

    const record = OrgApprovalRecord.create({
      orgId: command.orgId,
      reviewedBy: command.adminUserId,
      decision: ApprovalDecision.suspended,
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
