import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  OrgApprovalRecord,
  OrgApprovalRecordId,
  ApprovalDecision,
} from '../../../domain';
import { OrgApprovalRecord as PrismaOrgApprovalRecord } from '@generated/prisma/client';

@Injectable()
export class OrgApprovalRecordMapper
  implements IMapper<OrgApprovalRecord, PrismaOrgApprovalRecord>
{
  toDomain(record: PrismaOrgApprovalRecord): OrgApprovalRecord {
    return OrgApprovalRecord.reconstitute({
      id: OrgApprovalRecordId.from(record.id),
      orgId: record.orgId,
      reviewedBy: record.reviewedBy,
      decision: record.decision as ApprovalDecision,
      reason: record.reason,
      reviewedAt: record.reviewedAt,
      createdAt: record.createdAt,
    });
  }

  toPersistence(entity: OrgApprovalRecord): PrismaOrgApprovalRecord {
    return {
      id: entity.id.toString(),
      orgId: entity.orgId,
      reviewedBy: entity.reviewedBy,
      decision: entity.decision,
      reason: entity.reason,
      reviewedAt: entity.reviewedAt,
      createdAt: entity.createdAt,
    };
  }
}
