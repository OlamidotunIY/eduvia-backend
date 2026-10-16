import { ConflictError } from '@modules/shared';

export class TeacherUnavailableError extends ConflictError {
  constructor(details?: unknown) {
    super('Teacher has no availability slot covering this lesson time', details);
    this.code = this.constructor.name;
  }
}
