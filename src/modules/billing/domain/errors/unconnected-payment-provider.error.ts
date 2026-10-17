import { BadRequestError } from '@modules/shared/domain';

export class UnconnectedPaymentProviderError extends BadRequestError {
  constructor(orgId: string) {
    super(`Cannot create marketplace subscription plans for org '${orgId}' without a connected Stripe or PayPal account.`);
  }
}
