import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  OrgAnalyticsSnapshot,
  OrgAnalyticsSnapshotId,
  IOrgAnalyticsSnapshotRepository,
} from '../../../domain';
import { OrgAnalyticsSnapshotMapper } from '../mappers/org-analytics-snapshot.mapper';

@Injectable()
export class PrismaOrgAnalyticsSnapshotRepository
  implements IOrgAnalyticsSnapshotRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: OrgAnalyticsSnapshotMapper,
  ) {}

  public async findById(
    id: OrgAnalyticsSnapshotId | string,
  ): Promise<OrgAnalyticsSnapshot | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.orgAnalyticsSnapshot.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<OrgAnalyticsSnapshot[]> {
    const records = await this.prisma.orgAnalyticsSnapshot.findMany({
      orderBy: { snapshotDate: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findLatestByOrg(orgId: string): Promise<OrgAnalyticsSnapshot | null> {
    const record = await this.prisma.orgAnalyticsSnapshot.findFirst({
      where: { orgId },
      orderBy: { snapshotDate: 'desc' },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findByOrgAndDate(
    orgId: string,
    date: Date,
  ): Promise<OrgAnalyticsSnapshot | null> {
    const record = await this.prisma.orgAnalyticsSnapshot.findUnique({
      where: {
        orgId_snapshotDate: {
          orgId,
          snapshotDate: date,
        },
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findHistoryByOrg(
    orgId: string,
    limit = 30,
  ): Promise<OrgAnalyticsSnapshot[]> {
    const records = await this.prisma.orgAnalyticsSnapshot.findMany({
      where: { orgId },
      orderBy: { snapshotDate: 'desc' },
      take: limit,
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: OrgAnalyticsSnapshot): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const snapshotId = entity.id.unpack();

    await this.prisma.orgAnalyticsSnapshot.upsert({
      where: { id: snapshotId },
      create: {
        id: snapshotId,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: OrgAnalyticsSnapshotId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.orgAnalyticsSnapshot.delete({
      where: { id: rawId },
    });
  }
}
