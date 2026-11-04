import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { RejectTeacherApplicationCommand } from './reject-teacher-application.command';
import { RejectTeacherApplicationResult } from './reject-teacher-application.result';
import {
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import {
  OrganizationInvariantError,
  TeacherApplicationId,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(RejectTeacherApplicationCommand)
export class RejectTeacherApplicationHandler
  implements ICommandHandler<RejectTeacherApplicationCommand, RejectTeacherApplicationResult>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: RejectTeacherApplicationCommand,
  ): Promise<RejectTeacherApplicationResult> {
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

    application.reject(payload.reviewerUserId, payload.reason, payload.correlationId);

    await this.teacherApplicationRepository.save(application);

    return {
      id: application.getId(),
      status: application.status,
    };
  }
}
