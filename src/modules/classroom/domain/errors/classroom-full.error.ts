import { ConflictError } from '@modules/shared';

export class ClassroomFullError extends ConflictError {
  constructor(details?: unknown) {
    super('Classroom has reached maximum student capacity', details);
    this.code = this.constructor.name;
  }
}
