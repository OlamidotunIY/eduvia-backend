import { NotFoundError } from '@modules/shared';

export class StudentResponseNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Student response not found', details);
    this.code = this.constructor.name;
  }
}
