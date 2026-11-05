import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IOrganizationQueryPort,
  IUserQueryPort,
  UserType,
} from '@modules/shared';
import {
  ClassroomNotFoundError,
  IClassroomRepository,
  IStudentEnrollmentRepository,
} from '../../../domain';
import { ClassroomLearnerCandidateDTO } from './list-classroom-learner-candidates.dto';
import { ListClassroomLearnerCandidatesQuery } from './list-classroom-learner-candidates.query';

@QueryHandler(ListClassroomLearnerCandidatesQuery)
export class ListClassroomLearnerCandidatesHandler implements IQueryHandler<
  ListClassroomLearnerCandidatesQuery,
  ClassroomLearnerCandidateDTO[]
> {
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly enrollmentRepository: IStudentEnrollmentRepository,
    private readonly organizationQueryPort: IOrganizationQueryPort,
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async execute(
    query: ListClassroomLearnerCandidatesQuery,
  ): Promise<ClassroomLearnerCandidateDTO[]> {
    const classroom = await this.classroomRepository.findById(
      query.classroomId,
    );
    if (!classroom || classroom.orgId !== query.orgId)
      throw new ClassroomNotFoundError();

    const [memberIds, enrollments] = await Promise.all([
      this.organizationQueryPort.getActiveMemberUserIds(query.orgId),
      this.enrollmentRepository.findByClassroomId(query.classroomId),
    ]);
    const enrolledIds = new Set(
      enrollments
        .filter((enrollment) => enrollment.status === 'active')
        .map((enrollment) => enrollment.studentId),
    );
    const users = await Promise.all(
      memberIds
        .filter((id) => !enrolledIds.has(id))
        .map((id) => this.userQueryPort.getUserById(id)),
    );
    return users
      .filter(
        (user): user is NonNullable<typeof user> =>
          user?.userType === UserType.STUDENT && user.status === 'active',
      )
      .map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
      }));
  }
}
