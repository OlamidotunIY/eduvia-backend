import { BusinessRuleViolationError } from '@modules/shared';

export class InvalidMarkRangeError extends BusinessRuleViolationError {
  constructor(message = 'Marks awarded cannot be negative and cannot exceed the maximum allowed marks.') {
    super(message);
    this.code = this.constructor.name;
  }
}
