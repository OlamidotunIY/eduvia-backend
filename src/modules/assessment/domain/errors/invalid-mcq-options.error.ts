import { BusinessRuleViolationError } from '@modules/shared';

export class InvalidMcqOptionsError extends BusinessRuleViolationError {
  constructor(message = 'MCQ questions must have at least 2 options and a valid matching correctOptionKey.') {
    super(message);
    this.code = this.constructor.name;
  }
}
