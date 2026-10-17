import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { PlatformSubject, PlatformSubjectId } from '../../../domain';
import { PlatformSubject as PrismaPlatformSubject } from '@generated/prisma/client';

@Injectable()
export class PlatformSubjectMapper implements IMapper<PlatformSubject, PrismaPlatformSubject> {
  public toDomain(record: PrismaPlatformSubject): PlatformSubject {
    return PlatformSubject.reconstitute({
      id: PlatformSubjectId.from(record.id),
      name: record.name,
      shortCode: record.shortCode,
      description: record.description,
      isActive: record.isActive,
      createdAt: record.createdAt,
    });
  }

  public toPersistence(entity: PlatformSubject): Omit<PrismaPlatformSubject, 'id'> {
    return {
      name: entity.name,
      shortCode: entity.shortCode,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }
}
