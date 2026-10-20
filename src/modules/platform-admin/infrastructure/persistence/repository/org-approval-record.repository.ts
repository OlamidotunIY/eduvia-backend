import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  OrgApprovalRecord,
  OrgApprovalRecordId,
  IOrgApprovalRecordRepository,
} from '../../../domain';
import { OrgApprovalRecord as PrismaOrgApprovalRecord } from '@generated/prisma/client';
import { OrgApprovalRecordMapper } from '../mappers/org-approval-record.mapper';

@Injectable()
export class PrismaOrgApprovalRecordRepository
  extends PrismaBaseRepository<
    OrgApprovalRecordId,
    OrgApprovalRecord,
    PrismaOrgApprovalRecord
  >
  implements IOrgApprovalRecordRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly approvalMapper: OrgApprovalRecordMapper,
  ) {
    super(prisma, approvalMapper);
  }

  protected get delegate() {
    return this.prisma.orgApprovalRecord;
  }

  public override async findById(
    id: OrgApprovalRecordId | string,
  ): Promise<OrgApprovalRecord | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.orgApprovalRecord.findUnique({
      where: { id: rawId },
    });
    return record ? this.approvalMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<OrgApprovalRecord[]> {
    const records = await this.prisma.orgApprovalRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.approvalMapper.toDomain(record));
  }

  public async findByOrgId(orgId: string): Promise<OrgApprovalRecord[]> {
    const records = await this.prisma.orgApprovalRecord.findMany({
      where: { orgId },
      orderBy: { reviewedAt: 'desc' },
    });
    return records.map((record) => this.approvalMapper.toDomain(record));
  }

  public async findLatestByOrgId(orgId: string): Promise<OrgApprovalRecord | null> {
    const record = await this.prisma.orgApprovalRecord.findFirst({
      where: { orgId },
      orderBy: { reviewedAt: 'desc' },
    });
    return record ? this.approvalMapper.toDomain(record) : null;
  }

  public override async save(entity: OrgApprovalRecord): Promise<void> {
    const data = this.approvalMapper.toPersistence(entity);
    const recordId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.orgApprovalRecord.upsert({
        where: { id: recordId },
        create: {
          id: recordId,
          ...data,
        },
        update: data,
      });

      for (const event of events) {
        await tx.outboxMessage.create({
          data: {
            id: typeof event.eventId === 'string' ? event.eventId : String(event.eventId),
            eventId: event.eventId,
            type: event.eventName,
            aggregateType: entity.constructor.name,
            aggregateId: entity.getId(),
            payload: event.payload as object,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
            status: 'PENDING' as any,
          },
        });
      }
    });
  }

  public override async delete(id: OrgApprovalRecordId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.orgApprovalRecord.delete({
      where: { id: rawId },
    });
  }
}
