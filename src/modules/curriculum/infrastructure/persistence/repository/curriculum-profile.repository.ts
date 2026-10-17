import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  CurriculumProfile,
  CurriculumProfileId,
  ICurriculumProfileRepository,
} from '../../../domain';
import { CurriculumProfile as PrismaCurriculumProfile } from '@generated/prisma/client';
import { CurriculumProfileMapper } from '../mappers';

@Injectable()
export class PrismaCurriculumProfileRepository
  extends PrismaBaseRepository<CurriculumProfileId, CurriculumProfile, PrismaCurriculumProfile>
  implements ICurriculumProfileRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: CurriculumProfileMapper,
  ) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.curriculumProfile;
  }

  public async findByShortCode(shortCode: string): Promise<CurriculumProfile | null> {
    const record = await this.delegate.findUnique({
      where: { shortCode: shortCode.trim().toUpperCase() },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findByCountryCode(countryCode: string): Promise<CurriculumProfile[]> {
    const records = await this.delegate.findMany({
      where: { countryCode: countryCode.trim().toUpperCase() },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findActive(): Promise<CurriculumProfile[]> {
    const records = await this.delegate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }
}
