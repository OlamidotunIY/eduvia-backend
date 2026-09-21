import { BusinessRuleViolationError } from '../../../shared';

export class AccountPendingVerificationError extends BusinessRuleViolationError {
  constructor() {
    super('Account email is not verified');
    this.name = 'AccountPendingVerificationError';
  }
}
