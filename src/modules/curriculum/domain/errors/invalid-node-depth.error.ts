import { BusinessRuleViolationError } from '@modules/shared';

export class InvalidNodeDepthError extends BusinessRuleViolationError {
  constructor(message = 'Invalid curriculum node depth or hierarchy structure.') {
    super(message);
    this.code = this.constructor.name;
  }
}
