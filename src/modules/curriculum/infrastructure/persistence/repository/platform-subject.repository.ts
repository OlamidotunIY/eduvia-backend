import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  PlatformSubject,
  PlatformSubjectId,
  IPlatformSubjectRepository,
} from '../../../domain';
import { PlatformSubjectMapper } from '../mappers';

@Injectable()
export class PrismaPlatformSubjectRepository implements IPlatformSubjectRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: PlatformSubjectMapper,
  ) {}

  public async findById(id: PlatformSubjectId | string): Promise<PlatformSubject | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.platformSubject.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<PlatformSubject[]> {
    const records = await this.prisma.platformSubject.findMany({
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByShortCode(shortCode: string): Promise<PlatformSubject | null> {
    const record = await this.prisma.platformSubject.findUnique({
      where: { shortCode: shortCode.trim().toUpperCase() },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findActive(): Promise<PlatformSubject[]> {
    const records = await this.prisma.platformSubject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: PlatformSubject): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const id = entity.id.unpack();

    await this.prisma.platformSubject.upsert({
      where: { id },
      create: {
        id,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: PlatformSubjectId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.platformSubject.delete({
      where: { id: rawId },
    });
  }
}
