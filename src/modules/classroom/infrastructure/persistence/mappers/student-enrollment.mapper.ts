import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  StudentEnrollment,
  StudentEnrollmentId,
  EnrollmentStatus,
} from '../../../domain';
import { StudentEnrollment as PrismaStudentEnrollment } from '@generated/prisma/client';

@Injectable()
export class StudentEnrollmentMapper
  implements IMapper<StudentEnrollment, PrismaStudentEnrollment>
{
  toDomain(record: PrismaStudentEnrollment): StudentEnrollment {
    return StudentEnrollment.reconstitute({
      id: StudentEnrollmentId.from(record.id),
      classroomId: record.classroomId,
      studentId: record.studentId,
      orgId: record.orgId,
      status: record.status as EnrollmentStatus,
      enrolledAt: record.enrolledAt,
      removedAt: record.removedAt,
    });
  }

  toPersistence(
    entity: StudentEnrollment,
  ): Omit<PrismaStudentEnrollment, 'id'> {
    return {
      classroomId: entity.classroomId,
      studentId: entity.studentId,
      orgId: entity.orgId,
      status: entity.status,
      enrolledAt: entity.enrolledAt,
      removedAt: entity.removedAt,
    };
  }
}
