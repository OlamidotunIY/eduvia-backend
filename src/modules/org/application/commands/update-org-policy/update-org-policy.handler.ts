import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationPolicyCommand } from './update-org-policy.command';
import { UpdateOrganizationPolicyResult } from './update-org-policy.result';
import {
  IOrganizationMembershipRepository,
  IOrganizationRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationNotFound,
} from '../../../domain';

@CommandHandler(UpdateOrganizationPolicyCommand)
export class UpdateOrganizationPolicyHandler
  implements ICommandHandler<UpdateOrganizationPolicyCommand, UpdateOrganizationPolicyResult>
{
  constructor(
    private readonly orgRepository: IOrganizationRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: UpdateOrganizationPolicyCommand,
  ): Promise<UpdateOrganizationPolicyResult> {
    const { payload } = command;

    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.callerUserId,
    );

    if (!membership || !membership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
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
