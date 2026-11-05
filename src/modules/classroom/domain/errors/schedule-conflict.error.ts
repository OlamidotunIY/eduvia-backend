import { ConflictError } from '@modules/shared/domain';

export class ScheduleConflictError extends ConflictError {
  constructor(message = 'Schedule conflict detected for participant', details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}
