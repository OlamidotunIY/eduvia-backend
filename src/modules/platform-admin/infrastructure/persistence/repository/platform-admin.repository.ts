import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  PlatformAdmin,
  PlatformAdminId,
  PlatformAdminRole,
  IPlatformAdminRepository,
} from '../../../domain';
import { PlatformAdmin as PrismaPlatformAdmin } from '@generated/prisma/client';
import { PlatformAdminMapper } from '../mappers/platform-admin.mapper';

@Injectable()
export class PrismaPlatformAdminRepository
  extends PrismaBaseRepository<PlatformAdminId, PlatformAdmin, PrismaPlatformAdmin>
  implements IPlatformAdminRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly adminMapper: PlatformAdminMapper,
  ) {
    super(prisma, adminMapper);
  }

  protected get delegate() {
    return this.prisma.platformAdmin;
  }

  public override async findById(id: PlatformAdminId | string): Promise<PlatformAdmin | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.platformAdmin.findUnique({
      where: { id: rawId },
    });
    return record ? this.adminMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<PlatformAdmin[]> {
    const records = await this.prisma.platformAdmin.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.adminMapper.toDomain(record));
  }

  public async findByUserId(userId: string): Promise<PlatformAdmin | null> {
    const record = await this.prisma.platformAdmin.findUnique({
      where: { userId },
    });
    return record ? this.adminMapper.toDomain(record) : null;
  }

  public async findByRole(role: PlatformAdminRole): Promise<PlatformAdmin[]> {
    const records = await this.prisma.platformAdmin.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.adminMapper.toDomain(record));
  }

  public override async save(entity: PlatformAdmin): Promise<void> {
    const data = this.adminMapper.toPersistence(entity);
    const adminId = entity.id.unpack();

    await this.prisma.platformAdmin.upsert({
      where: { id: adminId },
      create: {
        id: adminId,
        ...data,
      },
      update: data,
    });
  }

  public override async delete(id: PlatformAdminId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.platformAdmin.delete({
      where: { id: rawId },
    });
  }
}
