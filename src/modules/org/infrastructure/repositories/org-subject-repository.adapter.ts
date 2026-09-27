import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { OrganizationId, OrganizationSubjectId } from '../../domain';
import { OrganizationSubject } from '../../domain/entities';
import { OrganizationSubject as PrismaOrganizationSubject } from '@generated/prisma/client';
import { OrganizationSubjectMapper } from '../mappers/organization-subject.mapper';
import { IOrganizationSubjectRepository } from '../../domain/repository';

@Injectable()
export class PrismaOrganizationSubjectRepository
  extends PrismaBaseRepository<
    OrganizationSubjectId,
    OrganizationSubject,
    PrismaOrganizationSubject
  >
  implements IOrganizationSubjectRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly organizationSubjectMapper: OrganizationSubjectMapper,
  ) {
    super(prisma, organizationSubjectMapper);
  }

  protected get delegate() {
    return this.prisma.organizationSubject;
  }

  public async findByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationSubject[]> {
    const records = await this.delegate.findMany({
      where: {
        orgId: String(orgId),
      },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findActiveSubjectsByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationSubject[]> {
    const records = await this.delegate.findMany({
      where: {
        orgId: organizationId,
        isActive: true,
      },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }
}
