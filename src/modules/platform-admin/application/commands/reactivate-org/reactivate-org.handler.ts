import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReactivateOrgCommand } from './reactivate-org.command';
import {
  IPlatformAdminRepository,
  IOrgApprovalRecordRepository,
  OrgApprovalRecord,
  ApprovalDecision,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface ReactivateOrgResult {
  id: string;
  orgId: string;
  decision: string;
}

@CommandHandler(ReactivateOrgCommand)
export class ReactivateOrgHandler
  implements ICommandHandler<ReactivateOrgCommand, ReactivateOrgResult>
{
  constructor(
    private readonly adminRepository: IPlatformAdminRepository,
    private readonly approvalRepository: IOrgApprovalRecordRepository,
  ) {}

  async execute(command: ReactivateOrgCommand): Promise<ReactivateOrgResult> {
    const admin = await this.adminRepository.findByUserId(command.adminUserId);
    if (!admin || !admin.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can reactivate organizations.',
      );
    }

    const record = OrgApprovalRecord.create({
      orgId: command.orgId,
      reviewedBy: command.adminUserId,
      decision: ApprovalDecision.reactivated,
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
