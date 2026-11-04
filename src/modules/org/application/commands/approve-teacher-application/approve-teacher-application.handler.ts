import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { ApproveTeacherApplicationCommand } from './approve-teacher-application.command';
import { ApproveTeacherApplicationResult } from './approve-teacher-application.result';
import {
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import {
  OrganizationInvariantError,
  TeacherApplicationId,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(ApproveTeacherApplicationCommand)
export class ApproveTeacherApplicationHandler
  implements ICommandHandler<ApproveTeacherApplicationCommand, ApproveTeacherApplicationResult>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: ApproveTeacherApplicationCommand,
  ): Promise<ApproveTeacherApplicationResult> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.reviewerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.APPLICATIONS_REVIEW)) {
      throw new OrganizationInvariantError('Caller cannot review teacher applications');
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
