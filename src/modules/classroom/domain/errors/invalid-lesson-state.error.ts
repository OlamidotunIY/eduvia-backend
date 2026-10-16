import { ConflictError } from '@modules/shared';

export class InvalidLessonStateError extends ConflictError {
  constructor(message = 'Invalid lesson state transition', details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}
