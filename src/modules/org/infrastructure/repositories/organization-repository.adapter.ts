import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  IOrganizationRepository,
  Organization,
  OrganizationId,
} from '../../domain';
import { Organization as PrismaOrganization } from '@generated/prisma/client';
import { OrganizationMapper } from '../mappers/organization.mapper';

@Injectable()
export class PrismaOrganizationRepository
  extends PrismaBaseRepository<OrganizationId, Organization, PrismaOrganization>
  implements IOrganizationRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly organizationMapper: OrganizationMapper,
  ) {
    super(prisma, organizationMapper);
  }

  protected get delegate() {
    return this.prisma.organization;
  }

  public async findBySlug(slug: string): Promise<Organization | null> {
    const organizationRecord = await this.delegate.findUnique({
      where: {
        slug,
      },
    });

    if (!organizationRecord) {
      return null;
    }

    return this.mapper.toDomain(organizationRecord);
  }

  public async findByOwnerId(ownerId: string): Promise<Organization[]> {
    const records = await this.delegate.findMany({
      where: {
        ownerId,
      },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }
}
