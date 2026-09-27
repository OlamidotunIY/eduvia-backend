import { Injectable } from '@nestjs/common';
import { IOrganizationMembershipRepository } from '../../domain/repository';
import { PrismaService } from '@modules/shared';
import { OrganizationMembershipMapper } from '../mappers/organization-membership.mapper';
import { OrganizationMembership } from '../../domain/entities';
import { OrganizationId } from '../../domain';

@Injectable()
export class PrismaOrganizationMembershipRepository implements IOrganizationMembershipRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: OrganizationMembershipMapper,
  ) {}

  protected get delegate() {
    return this.prisma.organizationMembership;
  }

  public async findByOrganizationId(orgId: OrganizationId | string): Promise<OrganizationMembership[]> {
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
}
