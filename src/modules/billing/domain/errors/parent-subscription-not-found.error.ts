import { NotFoundError } from '@modules/shared/domain';

export class ParentSubscriptionNotFoundError extends NotFoundError {
  constructor(subscriptionId: string) {
    super(`ParentSubscription '${subscriptionId}' was not found.`);
  }
}
