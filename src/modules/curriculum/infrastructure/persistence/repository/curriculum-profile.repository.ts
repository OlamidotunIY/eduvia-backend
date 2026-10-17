import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  CurriculumProfile,
  CurriculumProfileId,
  ICurriculumProfileRepository,
} from '../../../domain';
import { CurriculumProfileMapper } from '../mappers';

@Injectable()
export class PrismaCurriculumProfileRepository implements ICurriculumProfileRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: CurriculumProfileMapper,
  ) {}

  public async findById(id: CurriculumProfileId | string): Promise<CurriculumProfile | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.curriculumProfile.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<CurriculumProfile[]> {
    const records = await this.prisma.curriculumProfile.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByShortCode(shortCode: string): Promise<CurriculumProfile | null> {
    const record = await this.prisma.curriculumProfile.findUnique({
      where: { shortCode: shortCode.trim().toUpperCase() },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findByCountryCode(countryCode: string): Promise<CurriculumProfile[]> {
    const records = await this.prisma.curriculumProfile.findMany({
      where: { countryCode: countryCode.trim().toUpperCase() },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findActive(): Promise<CurriculumProfile[]> {
    const records = await this.prisma.curriculumProfile.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: CurriculumProfile): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const id = entity.id.unpack();

    await this.prisma.curriculumProfile.upsert({
      where: { id },
      create: {
        id,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: CurriculumProfileId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.curriculumProfile.delete({
      where: { id: rawId },
    });
  }
}
