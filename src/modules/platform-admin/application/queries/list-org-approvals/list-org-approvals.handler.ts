import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOrgApprovalsQuery } from './list-org-approvals.query';
import { IOrgApprovalRecordRepository } from '../../../domain';
import { OrgApprovalRecordDto } from '../dto/org-approval-record.dto';

@QueryHandler(ListOrgApprovalsQuery)
export class ListOrgApprovalsHandler
  implements IQueryHandler<ListOrgApprovalsQuery, OrgApprovalRecordDto[]>
{
  constructor(
    private readonly approvalRepository: IOrgApprovalRecordRepository,
  ) {}

  async execute(
    query: ListOrgApprovalsQuery,
  ): Promise<OrgApprovalRecordDto[]> {
    const records = query.orgId
      ? await this.approvalRepository.findByOrgId(query.orgId)
      : await this.approvalRepository.findAll();

    return records.map((r) => ({
      id: r.id.toString(),
      orgId: r.orgId,
      reviewedBy: r.reviewedBy,
      decision: r.decision,
      reason: r.reason,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
    }));
  }
}
