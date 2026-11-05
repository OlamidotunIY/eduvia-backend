import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IUserQueryPort } from '@modules/shared';
import {
  ClassroomNotFoundError,
  IClassroomRepository,
  IStudentEnrollmentRepository,
} from '../../../domain';
import { ClassroomStudentDTO } from './get-classroom-students.dto';
import { GetClassroomStudentsQuery } from './get-classroom-students.query';

@QueryHandler(GetClassroomStudentsQuery)
export class GetClassroomStudentsHandler implements IQueryHandler<
  GetClassroomStudentsQuery,
  ClassroomStudentDTO[]
> {
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly enrollmentRepository: IStudentEnrollmentRepository,
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async execute(
    query: GetClassroomStudentsQuery,
  ): Promise<ClassroomStudentDTO[]> {
    const classroom = await this.classroomRepository.findById(
      query.classroomId,
    );
    if (!classroom || classroom.orgId !== query.orgId) {
      throw new ClassroomNotFoundError();
    }

    const enrollments = await this.enrollmentRepository.findByClassroomId(
      query.classroomId,
    );
    return Promise.all(
      enrollments.map(async (enrollment) => {
        const learner = await this.userQueryPort.getUserById(
          enrollment.studentId,
        );
        return {
          id: enrollment.id.value,
          classroomId: enrollment.classroomId,
          orgId: enrollment.orgId,
          studentId: enrollment.studentId,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          removedAt: enrollment.removedAt,
          learner: learner
            ? {
                id: learner.id,
                firstName: learner.firstName,
                lastName: learner.lastName,
                email: learner.email,
                image: learner.image,
              }
            : null,
        };
      }),
    );
  }
}
