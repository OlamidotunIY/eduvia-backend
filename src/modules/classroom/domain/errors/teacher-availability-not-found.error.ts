import { NotFoundError } from '@modules/shared';

export class TeacherAvailabilityNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Teacher availability record not found', details);
    this.code = this.constructor.name;
  }
}
