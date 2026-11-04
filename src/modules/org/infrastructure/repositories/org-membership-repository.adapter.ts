import { Injectable } from '@nestjs/common';
import { IOrganizationMembershipRepository } from '../../domain/repository';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { OrganizationMembershipMapper } from '../mappers/organization-membership.mapper';
import { OrganizationMembership } from '../../domain/model';
import { OrganizationId, OrganizationMembershipId } from '../../domain';
import { OrganizationMembership as PrismaOrganizationMembership } from '@generated/prisma/client';

@Injectable()
export class PrismaOrganizationMembershipRepository
  extends PrismaBaseRepository<OrganizationMembershipId, OrganizationMembership, PrismaOrganizationMembership>
  implements IOrganizationMembershipRepository {
  constructor(
    prisma: PrismaService,
    mapper: OrganizationMembershipMapper,
  ) { super(prisma, mapper); }

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

}
