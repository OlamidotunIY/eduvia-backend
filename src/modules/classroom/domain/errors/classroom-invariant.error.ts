import { BusinessRuleViolationError } from '@modules/shared';

export class ClassroomInvariantError extends BusinessRuleViolationError {
  constructor(message = 'Classroom invariant violated', details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}
