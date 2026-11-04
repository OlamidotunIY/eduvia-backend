import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { GetTeacherApplicationsQuery } from './get-teacher-applications.query';
import { TeacherApplicationDTO } from './get-teacher-applications.dto';
import {
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import { OrganizationInvariantError, OrganizationPermission } from '../../../domain';

@QueryHandler(GetTeacherApplicationsQuery)
export class GetTeacherApplicationsHandler
  implements IQueryHandler<GetTeacherApplicationsQuery, TeacherApplicationDTO[]>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    query: GetTeacherApplicationsQuery,
  ): Promise<TeacherApplicationDTO[]> {
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      query.orgId,
      query.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.APPLICATIONS_READ)) {
      throw new OrganizationInvariantError('Caller cannot view teacher applications');
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
