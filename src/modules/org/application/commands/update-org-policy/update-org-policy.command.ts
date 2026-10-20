import { Command } from '@nestjs/cqrs';
import { UpdateOrganizationPolicyResult } from './update-org-policy.result';

export class UpdateOrganizationPolicyCommand extends Command<UpdateOrganizationPolicyResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      callerUserId: string;
      minimumBookingNoticeHours?: number;
      cancellationWindowHours?: number;
      noShowWaitMinutes?: number;
      autoRescheduleOnNoShow?: boolean;
      lessonPlanRequired?: boolean;
      reportRequiredWithinHours?: number;
      correlationId: string;
    },
  ) {
    super();
  }
}
