import { BusinessRuleViolationError } from '../../../shared';

export class InvalidCredentialsError extends BusinessRuleViolationError {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}
