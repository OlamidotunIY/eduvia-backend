import { Injectable } from '@nestjs/common';
import { ApplicationStatus,TeacherApplicationId } from '../../domain';
import { TeacherApplication as PrismaTeacherApplication } from '@generated/prisma/client';
import { TeacherApplication } from '../../domain/entities';


@Injectable()
export class TeacherApplicationMapper {
  toDomain(record: PrismaTeacherApplication): TeacherApplication {
    return TeacherApplication.reconstitute({
      id: TeacherApplicationId.from(record.id),
      orgId: record.orgId,
      applicantUserId: record.applicantUserId,
      appliedSubjects: record.appliedSubjects,
      status: record.status as ApplicationStatus,
      rejectionReason: record.rejectionReason,
      reviewedBy: record.reviewedBy,
      reviewedAt: record.reviewedAt,
      coverLetter: record.coverLetter,
      qualifications: record.qualifications,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: TeacherApplication): Omit<PrismaTeacherApplication, 'id'> {
    return {
      orgId: entity.orgId,
      applicantUserId: entity.applicantUserId,
      appliedSubjects: entity.appliedSubjects,
      status: entity.status as ApplicationStatus,
      rejectionReason: entity.rejectionReason,
      reviewedBy: entity.reviewedBy,
      reviewedAt: entity.reviewedAt,
      coverLetter: entity.coverLetter,
      qualifications: entity.qualifications,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
