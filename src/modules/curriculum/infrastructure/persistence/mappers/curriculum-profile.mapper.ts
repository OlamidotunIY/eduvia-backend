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
      description: record.description,
      authority: record.authority,
      isActive: record.isActive,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public toPersistence(entity: CurriculumProfile): Omit<PrismaCurriculumProfile, 'id'> {
    return {
      name: entity.name,
      shortCode: entity.shortCode,
      countryCode: entity.countryCode,
      description: entity.description,
      authority: entity.authority,
      isActive: entity.isActive,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
