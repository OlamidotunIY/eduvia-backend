import { NotFoundError } from '@modules/shared/domain';

export class SubscriptionPlanNotFoundError extends NotFoundError {
  constructor(planId: string) {
    super(`SubscriptionPlan '${planId}' was not found.`);
  }
}
