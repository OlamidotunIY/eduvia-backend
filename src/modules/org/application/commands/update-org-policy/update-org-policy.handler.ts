import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { UpdateOrganizationPolicyCommand } from './update-org-policy.command';
import { UpdateOrganizationPolicyResult } from './update-org-policy.result';
import {
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(UpdateOrganizationPolicyCommand)
export class UpdateOrganizationPolicyHandler
  implements ICommandHandler<UpdateOrganizationPolicyCommand, UpdateOrganizationPolicyResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: UpdateOrganizationPolicyCommand,
  ): Promise<UpdateOrganizationPolicyResult> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ORGANIZATION_POLICY_UPDATE)) {
      throw new OrganizationInvariantError('Caller cannot update organization policy');
    }

    const org = await this.orgRepository.findById(
      OrganizationId.from(payload.orgId),
    );
    if (!org) {
      throw new OrganizationNotFound();
    }

    org.updatePolicy({
      minimumBookingNoticeHours: payload.minimumBookingNoticeHours,
      cancellationWindowHours: payload.cancellationWindowHours,
      noShowWaitMinutes: payload.noShowWaitMinutes,
      autoRescheduleOnNoShow: payload.autoRescheduleOnNoShow,
      lessonPlanRequired: payload.lessonPlanRequired,
      reportRequiredWithinHours: payload.reportRequiredWithinHours,
    });

    await this.orgRepository.save(org);

    return {
      id: org.getId(),
    };
  }
}
