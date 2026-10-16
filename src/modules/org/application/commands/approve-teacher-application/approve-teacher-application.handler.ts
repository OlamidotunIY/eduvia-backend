import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveTeacherApplicationCommand } from './approve-teacher-application.command';
import { ApproveTeacherApplicationResult } from './approve-teacher-application.result';
import {
  IOrganizationMembershipRepository,
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import {
  OrganizationInvariantError,
  TeacherApplicationId,
} from '../../../domain';

@CommandHandler(ApproveTeacherApplicationCommand)
export class ApproveTeacherApplicationHandler
  implements ICommandHandler<ApproveTeacherApplicationCommand, ApproveTeacherApplicationResult>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: ApproveTeacherApplicationCommand,
  ): Promise<ApproveTeacherApplicationResult> {
    const { payload } = command;

    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.reviewerUserId,
    );

    if (!membership || !membership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
    }

    const application = await this.teacherApplicationRepository.findById(
      TeacherApplicationId.from(payload.applicationId),
    );

    if (!application) {
      throw new OrganizationInvariantError('Teacher application not found');
    }

    if (application.orgId.toString() !== payload.orgId) {
      throw new OrganizationInvariantError('Application does not belong to this organization');
    }

    application.approve(payload.reviewerUserId, payload.correlationId);

    await this.teacherApplicationRepository.save(application);

    return {
      id: application.getId(),
      status: application.status,
    };
  }
}
