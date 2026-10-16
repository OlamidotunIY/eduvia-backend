import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  StudentEnrollment,
  StudentEnrollmentId,
  IStudentEnrollmentRepository,
  EnrollmentStatus,
} from '../../../domain';
import { StudentEnrollment as PrismaStudentEnrollment } from '@generated/prisma/client';
import { StudentEnrollmentMapper } from '../mappers/student-enrollment.mapper';

@Injectable()
export class PrismaStudentEnrollmentRepository
  extends PrismaBaseRepository<
    StudentEnrollmentId,
    StudentEnrollment,
    PrismaStudentEnrollment
  >
  implements IStudentEnrollmentRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly studentEnrollmentMapper: StudentEnrollmentMapper,
  ) {
    super(prisma, studentEnrollmentMapper);
  }

  protected get delegate() {
    return this.prisma.studentEnrollment;
  }

  public async findByClassroomId(classroomId: string): Promise<StudentEnrollment[]> {
    const records = await this.delegate.findMany({
      where: { classroomId },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByStudentId(studentId: string): Promise<StudentEnrollment[]> {
    const records = await this.delegate.findMany({
      where: { studentId },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByClassroomAndStudent(
    classroomId: string,
    studentId: string,
  ): Promise<StudentEnrollment | null> {
    const record = await this.delegate.findFirst({
      where: { classroomId, studentId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async countActiveByClassroomId(classroomId: string): Promise<number> {
    return this.delegate.count({
      where: { classroomId, status: EnrollmentStatus.ACTIVE },
    });
  }
}
