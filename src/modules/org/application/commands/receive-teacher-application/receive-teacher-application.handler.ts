import { Optional } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReceiveTeacherApplicationCommand } from './receive-teacher-application.command';
import { ReceiveTeacherApplicationResult } from './receive-teacher-application.result';
import {
  ApplicationStatus,
  IOrganizationMembershipRepository,
  IOrganizationRepository,
  OrganizationInvariantError,
  OrganizationNotActiveError,
  OrganizationNotFound,
} from '../../../domain';
import { ITeacherApplicationRepository } from '../../../domain/repository/teacher-application.repository';
import { TeacherApplication } from '../../../domain/entities';


@CommandHandler(ReceiveTeacherApplicationCommand)
export class ReceiveTeacherApplicationHandler implements ICommandHandler<
  ReceiveTeacherApplicationCommand,
  ReceiveTeacherApplicationResult
> {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    @Optional()
    private readonly membershipRepository?: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: ReceiveTeacherApplicationCommand,
  ): Promise<ReceiveTeacherApplicationResult> {
    const { payload } = command;

    const organization = await this.organizationRepository.findById(
      payload.orgId,
    );

    if (!organization) {
      throw new OrganizationNotFound('Organization not found');
    }

    if (!organization.isActive()) {
      throw new OrganizationNotActiveError(
        'Only active organizations can receive teacher applications',
      );
    }

    if (!organization.acceptingTeachers) {
      throw new OrganizationInvariantError('Organization is not accepting teacher applications');
    }

    if (this.membershipRepository) {
      const existingMembership = await this.membershipRepository.findByOrgIdAndUserId(
        payload.orgId,
        payload.applicantUserId,
      );
      if (existingMembership?.isActive()) {
        throw new OrganizationInvariantError('You are already an active member of this organization');
      }
    }

    const existingApplication =
      await this.teacherApplicationRepository.findByOrgIdAndApplicantUserId(
        payload.orgId,
        payload.applicantUserId,
      );

    if (
      existingApplication &&
      (existingApplication.status === ApplicationStatus.PENDING_REVIEW ||
        existingApplication.status === ApplicationStatus.APPROVED)
    ) {
      throw new OrganizationInvariantError('You already have an active application for this organization');
    }

    const appliedSubjects = Array.from(
      new Set(
        (payload.appliedSubjects ?? [])
          .map((subject) => subject.trim())
          .filter(Boolean),
      ),
    );
    const coverLetter = payload.coverLetter?.trim() || null;
    const qualifications = payload.qualifications?.trim() || null;

    const application = TeacherApplication.create({
      orgId: organization.id,
      applicantUserId: payload.applicantUserId,
      appliedSubjects,
      coverLetter,
      qualifications,
      correlationId: payload.correlationId,
    });

    await this.teacherApplicationRepository.save(application);

    return {
      id: application.getId(),
      applicantUserId: application.applicantUserId,
      appliedSubjects: application.appliedSubjects,
    };
  }
}
