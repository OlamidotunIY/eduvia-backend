import { NotFoundError } from '@modules/shared';

export class ClassroomNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Classroom not found', details);
    this.code = this.constructor.name;
  }
}
