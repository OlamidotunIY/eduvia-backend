import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTeacherApplicationsQuery } from './get-teacher-applications.query';
import { TeacherApplicationDTO } from './get-teacher-applications.dto';
import {
  IOrganizationMembershipRepository,
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import { OrganizationInvariantError } from '../../../domain';

@QueryHandler(GetTeacherApplicationsQuery)
export class GetTeacherApplicationsHandler
  implements IQueryHandler<GetTeacherApplicationsQuery, TeacherApplicationDTO[]>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    query: GetTeacherApplicationsQuery,
  ): Promise<TeacherApplicationDTO[]> {
    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      query.orgId,
      query.callerUserId,
    );

    if (!membership || !membership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
    }

    const applications = await this.teacherApplicationRepository.findByOrganizationId(
      query.orgId,
    );

    return applications.map((app) => ({
      id: app.getId(),
      orgId: app.orgId.toString(),
      applicantUserId: app.applicantUserId,
      appliedSubjects: app.appliedSubjects,
      status: app.status,
      rejectionReason: app.rejectionReason,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt,
      coverLetter: app.coverLetter,
      qualifications: app.qualifications,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));
  }
}
