export class UpdatePolicyDTO {
  minimumBookingNoticeHours?: number;
  cancellationWindowHours?: number;
  noShowWaitMinutes?: number;
  autoRescheduleOnNoShow?: boolean;
  lessonPlanRequired?: boolean;
  reportRequiredWithinHours?: number;
}
