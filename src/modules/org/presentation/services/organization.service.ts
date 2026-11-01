import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ChangeMemberRoleDTO,
  CreateOrganizationDTO,
  CreateSubjectDTO,
  ReceiveTeacherApplicationDTO,
  RejectApplicationDTO,
  SendInvitationDTO,
  UpdateOrganizationDTO,
  UpdatePolicyDTO,
  UpdateSubjectDTO,
} from '../dto';
import {
  AcceptOrganizationInvitationByTokenCommand,
  ApproveTeacherApplicationCommand,
  ChangeMemberRoleCommand,
  CreateOrganizationCommand,
  CreateOrganizationSubjectCommand,
  DelistOrganizationFromMarketplaceCommand,
  ListOrganizationOnMarketplaceCommand,
  ReceiveTeacherApplicationCommand,
  RejectTeacherApplicationCommand,
  SendOrganizationInvitationCommand,
  SuspendMemberCommand,
  SelectActiveOrganizationCommand,
  UpdateOrganizationPolicyCommand,
  UpdateOrganizationProfileCommand,
  UpdateOrganizationSubjectCommand,
} from '../../application/commands';
import {
  GetOrganizationBySlugQuery,
  GetOrganizationMembersQuery,
  GetOrganizationSubjectsQuery,
  GetTeacherApplicationsQuery,
  ListMarketplaceOrganizationsQuery,
} from '../../application/queries';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createOrganization(
    dto: CreateOrganizationDTO,
    ownerId: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new CreateOrganizationCommand({
        ownerId,
        name: dto.name,
        slug: dto.slug,
        contactEmail: dto.contactEmail,
        country: dto.country,
        timezone: dto.timezone,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        correlationId,
      }),
    );
  }

  async selectActiveOrganization(
    userId: string,
    organizationId: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(new SelectActiveOrganizationCommand({
      userId,
      organizationId,
      correlationId,
    }));
  }

  async getOrganizationBySlug(slug: string) {
    return this.queryBus.execute(new GetOrganizationBySlugQuery(slug));
  }

  async listMarketplaceOrganizations() {
    return this.queryBus.execute(new ListMarketplaceOrganizationsQuery());
  }

  async updateProfile(
    orgId: string,
    callerUserId: string,
    dto: UpdateOrganizationDTO,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new UpdateOrganizationProfileCommand({
        orgId,
        callerUserId,
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        country: dto.country,
        timezone: dto.timezone,
        correlationId,
      }),
    );
  }

  async listOnMarketplace(
    orgId: string,
    callerUserId: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new ListOrganizationOnMarketplaceCommand({
        orgId,
        callerUserId,
        correlationId,
      }),
    );
  }

  async delistFromMarketplace(
    orgId: string,
    callerUserId: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new DelistOrganizationFromMarketplaceCommand({
        orgId,
        callerUserId,
        correlationId,
      }),
    );
  }

  async updatePolicy(
    orgId: string,
    callerUserId: string,
    dto: UpdatePolicyDTO,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new UpdateOrganizationPolicyCommand({
        orgId,
        callerUserId,
        minimumBookingNoticeHours: dto.minimumBookingNoticeHours,
        cancellationWindowHours: dto.cancellationWindowHours,
        noShowWaitMinutes: dto.noShowWaitMinutes,
        autoRescheduleOnNoShow: dto.autoRescheduleOnNoShow,
        lessonPlanRequired: dto.lessonPlanRequired,
        reportRequiredWithinHours: dto.reportRequiredWithinHours,
        correlationId,
      }),
    );
  }

  async createSubject(
    orgId: string,
    callerUserId: string,
    dto: CreateSubjectDTO,
  ) {
    return this.commandBus.execute(
      new CreateOrganizationSubjectCommand({
        orgId,
        callerUserId,
        name: dto.name,
        platformSubjectId: dto.platformSubjectId,
        description: dto.description,
      }),
    );
  }

  async updateSubject(
    orgId: string,
    subjectId: string,
    _callerUserId: string,
    dto: UpdateSubjectDTO,
  ) {
    return this.commandBus.execute(
      new UpdateOrganizationSubjectCommand({
        orgId,
        subjectId,
        name: dto.name,
        platformSubjectId: dto.platformSubjectId,
        description: dto.description,
        isActive: dto.isActive,
      }),
    );
  }

  async getSubjects(orgId: string, activeOnly?: boolean) {
    return this.queryBus.execute(
      new GetOrganizationSubjectsQuery(orgId, activeOnly),
    );
  }

  async applyToOrganization(
    organizationId: string,
    userId: string,
    dto: ReceiveTeacherApplicationDTO,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new ReceiveTeacherApplicationCommand({
        orgId: organizationId,
        applicantUserId: userId,
        appliedSubjects: dto.appliedSubjects,
        coverLetter: dto.coverLetter,
        qualifications: dto.qualifications,
        correlationId,
      }),
    );
  }

  async getApplications(orgId: string, callerUserId: string) {
    return this.queryBus.execute(
      new GetTeacherApplicationsQuery(orgId, callerUserId),
    );
  }

  async approveApplication(
    orgId: string,
    applicationId: string,
    callerUserId: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new ApproveTeacherApplicationCommand({
        applicationId,
        orgId,
        reviewerUserId: callerUserId,
        correlationId,
      }),
    );
  }

  async rejectApplication(
    orgId: string,
    applicationId: string,
    callerUserId: string,
    dto: RejectApplicationDTO,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new RejectTeacherApplicationCommand({
        applicationId,
        orgId,
        reviewerUserId: callerUserId,
        reason: dto.reason ?? null,
        correlationId,
      }),
    );
  }

  async sendInvitation(
    orgId: string,
    callerUserId: string,
    dto: SendInvitationDTO,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new SendOrganizationInvitationCommand({
        orgId,
        callerUserId,
        inviteeEmail: dto.inviteeEmail,
        role: dto.role,
        subjects: dto.subjects,
        correlationId,
      }),
    );
  }

  async acceptInvitation(
    rawToken: string,
    userId: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new AcceptOrganizationInvitationByTokenCommand({
        rawToken,
        acceptedByUserId: userId,
        correlationId,
      }),
    );
  }

  async getMembers(orgId: string, callerUserId: string) {
    return this.queryBus.execute(
      new GetOrganizationMembersQuery(orgId, callerUserId),
    );
  }

  async changeMemberRole(
    orgId: string,
    callerUserId: string,
    targetUserId: string,
    dto: ChangeMemberRoleDTO,
  ) {
    return this.commandBus.execute(
      new ChangeMemberRoleCommand({
        orgId,
        callerUserId,
        targetUserId,
        newRole: dto.role,
      }),
    );
  }

  async suspendMember(
    orgId: string,
    callerUserId: string,
    targetUserId: string,
  ) {
    return this.commandBus.execute(
      new SuspendMemberCommand({
        orgId,
        callerUserId,
        targetUserId,
      }),
    );
  }
}
