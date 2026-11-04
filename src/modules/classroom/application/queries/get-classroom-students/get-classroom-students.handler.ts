import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ClassroomNotFoundError,
  IClassroomRepository,
  IStudentEnrollmentRepository,
} from '../../../domain';
import { ClassroomStudentDTO } from './get-classroom-students.dto';
import { GetClassroomStudentsQuery } from './get-classroom-students.query';

@QueryHandler(GetClassroomStudentsQuery)
export class GetClassroomStudentsHandler
  implements IQueryHandler<GetClassroomStudentsQuery, ClassroomStudentDTO[]>
{
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly enrollmentRepository: IStudentEnrollmentRepository,
  ) {}

  async execute(query: GetClassroomStudentsQuery): Promise<ClassroomStudentDTO[]> {
    const classroom = await this.classroomRepository.findById(query.classroomId);
    if (!classroom || classroom.orgId !== query.orgId) {
      throw new ClassroomNotFoundError();
    }

    const enrollments = await this.enrollmentRepository.findByClassroomId(
      query.classroomId,
    );
    return enrollments.map((enrollment) => ({
      id: enrollment.id.value,
      classroomId: enrollment.classroomId,
      orgId: enrollment.orgId,
      studentId: enrollment.studentId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      removedAt: enrollment.removedAt,
    }));
  }
}
