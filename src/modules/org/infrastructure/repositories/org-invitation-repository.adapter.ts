import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { OrganizationInvitation as PrismaOrganizationInvitation } from '@generated/prisma/client';
import { OrganizationId, OrganizationInvitationId } from '../../domain';
import { OrganizationInvitation } from '../../domain/model';
import { OrganizationInvitationMapper } from '../mappers/organization-invitation.mapper';
import { IOrganizationInvitationRepository } from '../../domain/repository/org-invitation.repository';

@Injectable()
export class PrismaOrganizationInvitationRepository
  extends PrismaBaseRepository<
    OrganizationInvitationId,
    OrganizationInvitation,
    PrismaOrganizationInvitation
  >
  implements IOrganizationInvitationRepository
{
  constructor(
    prisma: PrismaService,
    organizationInvitationMapper: OrganizationInvitationMapper,
  ) {
    super(prisma, organizationInvitationMapper);
  }

  protected get delegate() {
    return this.prisma.organizationInvitation;
  }

  public async findByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationInvitation[]> {
    const records = await this.delegate.findMany({
      where: {
        orgId: String(orgId),
      },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByTokenHash(
    tokenHash: string,
  ): Promise<OrganizationInvitation | null> {
    const record = await this.delegate.findFirst({
      where: { tokenHash },
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}
