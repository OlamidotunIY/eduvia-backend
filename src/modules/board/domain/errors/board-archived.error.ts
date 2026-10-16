import { BusinessRuleViolationError } from '@modules/shared';

export class BoardArchivedError extends BusinessRuleViolationError {
  constructor(details?: unknown) {
    super('Board is read-only because the associated lesson is archived.', details);
    this.code = this.constructor.name;
  }
}
