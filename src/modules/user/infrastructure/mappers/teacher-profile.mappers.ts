import { Injectable } from '@nestjs/common';
import { TeacherProfile as PrismaTeacherProfile } from '@generated/prisma/client';

import { TeacherProfile, TeacherProfileId, UserId } from '../../domain';

@Injectable()
export class TeacherProfileMapper {
  toDomain(record: PrismaTeacherProfile): TeacherProfile {
    return TeacherProfile.reconstitute({
      id: TeacherProfileId.from(record.id),
      userId: UserId.from(record.userId),
      activeOrganizationId: record.activeOrganizationId,
      bio: record.bio,
      phoneNumber: record.phoneNumber,
      avatarUrl: record.avatarUrl,
      qualification: record.qualification,
      yearOfExperience: record.yearOfExperience,
      subjects: record.subjects,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: TeacherProfile): Omit<PrismaTeacherProfile, 'id'> {
    return {
      userId: entity.userId.value,
      activeOrganizationId: entity.activeOrganizationId,
      bio: entity.bio,
      phoneNumber: entity.phoneNumber,
      avatarUrl: entity.avatarUrl,
      qualification: entity.qualification,
      yearOfExperience: entity.yearOfExperience,
      subjects: entity.subjects,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
