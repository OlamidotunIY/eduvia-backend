import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { CurriculumProfile, CurriculumProfileId } from '../../../domain';
import { CurriculumProfile as PrismaCurriculumProfile } from '@generated/prisma/client';

@Injectable()
export class CurriculumProfileMapper implements IMapper<CurriculumProfile, PrismaCurriculumProfile> {
  public toDomain(record: PrismaCurriculumProfile): CurriculumProfile {
    return CurriculumProfile.reconstitute({
      id: CurriculumProfileId.from(record.id),
      name: record.name,
      shortCode: record.shortCode,
      countryCode: record.countryCode,
      jurisdictionCode: record.jurisdictionCode,
      description: record.description,
      authority: record.authority,
      isActive: record.isActive,
      version: record.version,
      sourceUrl: record.sourceUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public toPersistence(entity: CurriculumProfile): Omit<PrismaCurriculumProfile, 'id'> {
    return {
      name: entity.name,
      shortCode: entity.shortCode,
      countryCode: entity.countryCode,
      jurisdictionCode: entity.jurisdictionCode,
      description: entity.description,
      authority: entity.authority,
      isActive: entity.isActive,
      version: entity.version,
      sourceUrl: entity.sourceUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
