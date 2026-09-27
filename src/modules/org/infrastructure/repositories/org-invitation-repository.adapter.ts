import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { OrganizationInvitation as PrismaOrganizationInvitationn } from '@generated/prisma/client';
import { OrganizationId, OrganizationInvitationId } from '../../domain';
import { OrganizationInvitation } from '../../domain/entities';
import { OrganizationInvitationMapper } from '../mappers/organization-invitation.mapper';
import { IOrganizationInvitationRepository } from '../../domain/repository/org-invitation.repository';

@Injectable()
export class PrismaOrganizationInvitationRepository
  extends PrismaBaseRepository<
    OrganizationInvitationId,
    OrganizationInvitation,
    PrismaOrganizationInvitationn
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
    orgId: OrganizationId |string,
  ): Promise<OrganizationInvitation[]> {
    const records = await this.delegate.findMany({
      where: {
        orgId: String(orgId),
      },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  
}
