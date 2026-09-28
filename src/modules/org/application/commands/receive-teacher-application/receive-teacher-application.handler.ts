import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReceiveTeacherApplicationCommand } from './receive-teacher-application.command';
import { ReceiveTeacherApplicationResult } from './receive-teacher-application.result';
import { IOrganizationRepository, OrganizationInvariantError, OrganizationNotActiveError, OrganizationNotFound } from '../../../domain';
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

    const existingApplication =
      await this.teacherApplicationRepository.findByApplicantUserId(
        payload.applicantUserId,
      );

    if (existingApplication) {
      throw new OrganizationInvariantError('Teacher already has an application');
    }

    const application = TeacherApplication.create({
      orgId: organization.id,
      applicantUserId: payload.applicantUserId,
      appliedSubjects: payload.appliedSubjects,
      coverLetter: payload.coverLetter,
      qualifications: payload.qualifications,
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
