import { Injectable } from '@nestjs/common';
import { IOrganizationMembershipRepository } from '../../domain/repository';
import { PrismaService } from '@modules/shared';
import { OrganizationMembershipMapper } from '../mappers/organization-membership.mapper';
import { OrganizationMembership } from '../../domain/model';
import { MembershipStatus, OrganizationId, OrganizationRole } from '../../domain';

@Injectable()
export class PrismaOrganizationMembershipRepository implements IOrganizationMembershipRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: OrganizationMembershipMapper,
  ) {}

  protected get delegate() {
    return this.prisma.organizationMembership;
  }

  public async findByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationMembership[]> {
    const records = await this.delegate.findMany({
      where: {
        orgId: String(orgId),
      },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByUserId(userId: string): Promise<OrganizationMembership[]> {
    const records = await this.delegate.findMany({
      where: {
        userId,
      },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByOrgIdAndUserId(
    orgId: OrganizationId | string,
    userId: string,
  ): Promise<OrganizationMembership | null> {
    const record = await this.delegate.findFirst({
      where: {
        orgId: String(orgId),
        userId,
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async save(membership: OrganizationMembership): Promise<void> {
    await this.delegate.create({
      data: {
        id: membership.id.value,
        orgId: membership.orgId.value,
        userId: membership.userId,
        role: membership.role as OrganizationRole,
        subjects: membership.subjects,
        status: membership.status as MembershipStatus,
        joinedAt: membership.joinedAt,
      },
    });
  }
}
