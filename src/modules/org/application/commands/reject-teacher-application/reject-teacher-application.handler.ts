import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectTeacherApplicationCommand } from './reject-teacher-application.command';
import { RejectTeacherApplicationResult } from './reject-teacher-application.result';
import {
  IOrganizationMembershipRepository,
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import {
  OrganizationInvariantError,
  TeacherApplicationId,
} from '../../../domain';

@CommandHandler(RejectTeacherApplicationCommand)
export class RejectTeacherApplicationHandler
  implements ICommandHandler<RejectTeacherApplicationCommand, RejectTeacherApplicationResult>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: RejectTeacherApplicationCommand,
  ): Promise<RejectTeacherApplicationResult> {
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

    application.reject(payload.reviewerUserId, payload.reason, payload.correlationId);

    await this.teacherApplicationRepository.save(application);

    return {
      id: application.getId(),
      status: application.status,
    };
  }
}
