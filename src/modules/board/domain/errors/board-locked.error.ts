import { BusinessRuleViolationError } from '@modules/shared';

export class BoardLockedError extends BusinessRuleViolationError {
  constructor(details?: unknown) {
    super('Board is locked. No student or client modifications are accepted.', details);
    this.code = this.constructor.name;
  }
}
