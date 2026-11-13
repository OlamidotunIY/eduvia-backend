import { Optional } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IOrganizationAuthorizationQueryPort,
  IUserQueryPort,
} from '@modules/shared';
import { GetTeacherApplicationsQuery } from './get-teacher-applications.query';
import {
  ApplicationSubjectDTO,
  ApplicationUserSummaryDTO,
  TeacherApplicationDTO,
} from './get-teacher-applications.dto';
import {
  IOrganizationMembershipRepository,
  IOrganizationRoleRepository,
  IOrganizationSubjectRepository,
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import {
  ApplicationStatus,
  OrganizationInvariantError,
  OrganizationPermission,
  legacyRoleToRoleKey,
} from '../../../domain';

@QueryHandler(GetTeacherApplicationsQuery)
export class GetTeacherApplicationsHandler
  implements IQueryHandler<GetTeacherApplicationsQuery, TeacherApplicationDTO[]>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    @Optional()
    private readonly userQuery?: IUserQueryPort,
    @Optional()
    private readonly orgSubjectRepository?: IOrganizationSubjectRepository,
    @Optional()
    private readonly membershipRepository?: IOrganizationMembershipRepository,
    @Optional()
    private readonly roleRepository?: IOrganizationRoleRepository,
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

    const allApplications = await this.teacherApplicationRepository.findByOrganizationId(
      query.orgId,
    );
    const applications = (
      query.status
        ? allApplications.filter((app) => app.status === query.status)
        : allApplications
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const userIds = Array.from(
      new Set(
        applications
          .flatMap((app) => [app.applicantUserId, app.reviewedBy])
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const [users, subjects, memberships, roles] = await Promise.all([
      userIds.length > 0 && this.userQuery
        ? this.userQuery.getUsersByIds(userIds)
        : Promise.resolve([]),
      this.orgSubjectRepository
        ? this.orgSubjectRepository.findByOrganizationId(query.orgId)
        : Promise.resolve([]),
      this.membershipRepository
        ? this.membershipRepository.findByOrganizationId(query.orgId)
        : Promise.resolve([]),
      this.roleRepository
        ? this.roleRepository.findByOrgId(query.orgId)
        : Promise.resolve([]),
    ]);

    const userMap = new Map<string, ApplicationUserSummaryDTO>();
    for (const user of users) {
      if (!user) continue;
      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.email ||
        null;
      userMap.set(user.id, {
        id: user.id,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        fullName,
        email: user.email ?? null,
        image: user.image ?? null,
        avatarUrl: user.image ?? null,
      });
    }

    const subjectById = new Map<string, ApplicationSubjectDTO>();
    const subjectByNameLower = new Map<string, ApplicationSubjectDTO>();
    for (const subject of subjects) {
      const dto: ApplicationSubjectDTO = {
        id: subject.getId(),
        name: subject.name,
      };
      subjectById.set(dto.id, dto);
      subjectByNameLower.set(dto.name.trim().toLowerCase(), dto);
    }

    const membershipByUserId = new Map(
      memberships.map((membership) => [membership.userId, membership]),
    );
    const roleById = new Map(roles.map((role) => [role.getId(), role]));
    const roleByKey = new Map(
      roles
        .filter((role) => Boolean(role.key))
        .map((role) => [role.key!, role]),
    );

    const resolveSubjects = (values: string[]): ApplicationSubjectDTO[] =>
      values.map((raw) => {
        const trimmed = String(raw).trim();
        return (
          subjectById.get(trimmed) ??
          subjectByNameLower.get(trimmed.toLowerCase()) ?? {
            id: trimmed,
            name: trimmed,
          }
        );
      });

    return applications.map((app) => {
      const membership =
        app.status === ApplicationStatus.APPROVED
          ? membershipByUserId.get(app.applicantUserId)
          : undefined;
      const matchedRole = membership
        ? (membership.roleId
            ? roleById.get(membership.roleId.value)
            : roleByKey.get(legacyRoleToRoleKey(membership.role)))
        : undefined;

      const approvedSubjects = membership ? membership.subjects : null;

      return {
        id: app.getId(),
        orgId: app.orgId.toString(),
        applicantUserId: app.applicantUserId,
        applicant: userMap.get(app.applicantUserId) ?? null,
        appliedSubjects: app.appliedSubjects,
        appliedSubjectDetails: resolveSubjects(app.appliedSubjects),
        status: app.status,
        rejectionReason: app.rejectionReason,
        reviewedBy: app.reviewedBy,
        reviewer: app.reviewedBy ? (userMap.get(app.reviewedBy) ?? null) : null,
        reviewedAt: app.reviewedAt,
        coverLetter: app.coverLetter,
        qualifications: app.qualifications,
        assignedRole: membership ? membership.role : null,
        assignedRoleId: membership?.roleId?.value ?? matchedRole?.getId() ?? null,
        assignedRoleName: matchedRole?.name ?? membership?.role ?? null,
        approvedSubjects,
        approvedSubjectDetails: approvedSubjects
          ? resolveSubjects(approvedSubjects)
          : null,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };
    });
  }
}
