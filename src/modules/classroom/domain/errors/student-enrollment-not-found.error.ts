import { NotFoundError } from '@modules/shared/domain';

export class StudentEnrollmentNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Student enrollment not found', details);
    this.code = this.constructor.name;
  }
}
