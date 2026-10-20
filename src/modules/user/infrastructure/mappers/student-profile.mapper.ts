import { Injectable } from '@nestjs/common';
import { StudentProfile as PrismaStudentProfile } from '@generated/prisma/client';
import { ParentProfileId, StudentProfile, StudentProfileId } from '../../domain';

@Injectable()
export class StudentProfileMapper {
  toDomain(record: PrismaStudentProfile): StudentProfile {
    return StudentProfile.reconstitute({
      id: StudentProfileId.from(record.id),
      parentId: ParentProfileId.from(record.parentId),
      dateOfBirth: record.dateOfBirth,
      countryCode: record.countryCode,
      timezone: record.timezone,
      gradeLevel: record.gradeLevel,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: StudentProfile): Omit<PrismaStudentProfile, 'id'> {
    return {
      parentId: entity.parentId.value,
      dateOfBirth: entity.dateOfBirth,
      countryCode: entity.countryCode,
      timezone: entity.timezone,
      gradeLevel: entity.gradeLevel,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
