import { Injectable } from '@nestjs/common';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import {
  IOrganizationRoleRepository,
  OrganizationAccessRole,
  OrganizationId,
  OrganizationRoleId,
  OrganizationRoleKey,
} from '../../domain';
import { OrganizationRoleMapper } from '../mappers/organization-role.mapper';

@Injectable()
export class PrismaOrganizationRoleRepository
  extends PrismaBaseRepository<OrganizationRoleId, OrganizationAccessRole, any>
  implements IOrganizationRoleRepository
{
  constructor(prisma: PrismaService, mapper: OrganizationRoleMapper) {
    super(prisma, mapper);
  }

  protected get delegate(): any {
    return (this.prisma as any).organizationAccessRole;
  }

  async findByOrgId(orgId: OrganizationId | string): Promise<OrganizationAccessRole[]> {
    const records = await this.delegate.findMany({ where: { orgId: String(orgId) } });
    return records.map((record: any) => this.mapper.toDomain(record));
  }

  async findByOrgIdAndKey(orgId: OrganizationId | string, key: OrganizationRoleKey): Promise<OrganizationAccessRole | null> {
    const record = await this.delegate.findFirst({ where: { orgId: String(orgId), key } });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findByOrgIdAndName(orgId: OrganizationId | string, name: string): Promise<OrganizationAccessRole | null> {
    const record = await this.delegate.findFirst({ where: { orgId: String(orgId), name } });
    return record ? this.mapper.toDomain(record) : null;
  }
}
