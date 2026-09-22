import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/shared';
import { IParentProfileRepository, ParentProfile, ParentProfileId, UserId } from '../../domain';
import { ParentProfileMapper } from '../mappers';

@Injectable()
export class PrismaParentProfileRepository implements IParentProfileRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ParentProfileMapper,
  ) {}

  async findById(id: ParentProfileId | string): Promise<ParentProfile | null> {
    const record = await this.prisma.parentProfile.findUnique({
      where: { id: String(id) },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findAll(): Promise<ParentProfile[]> {
    const records = await this.prisma.parentProfile.findMany();
    return records.map((record) => this.mapper.toDomain(record));
  }

  async findByUserId(userId: UserId): Promise<ParentProfile | null> {
    const record = await this.prisma.parentProfile.findUnique({
      where: { userId: userId.value },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async save(entity: ParentProfile): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    await this.prisma.parentProfile.upsert({
      where: { id: entity.id.value },
      create: { id: entity.id.value, ...data },
      update: data,
    });
  }

  async delete(id: ParentProfileId | string): Promise<void> {
    await this.prisma.parentProfile.delete({ where: { id: String(id) } });
  }
}
