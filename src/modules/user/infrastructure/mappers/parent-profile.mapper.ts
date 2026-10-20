import { Injectable } from '@nestjs/common';
import { ParentProfile as PrismaParentProfile } from '@generated/prisma/client';
import { ParentProfile, ParentProfileId, UserId } from '../../domain';

@Injectable()
export class ParentProfileMapper {
  toDomain(record: PrismaParentProfile): ParentProfile {
    return ParentProfile.reconstitute({
      id: ParentProfileId.from(record.id),
      userId: UserId.from(record.userId),
      phoneNumber: record.phoneNumber,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: ParentProfile): Omit<PrismaParentProfile, 'id'> {
    return {
      userId: entity.userId.value,
      phoneNumber: entity.phoneNumber,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
