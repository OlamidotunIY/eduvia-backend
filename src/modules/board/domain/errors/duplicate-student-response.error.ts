import { ConflictError } from '@modules/shared';

export class DuplicateStudentResponseError extends ConflictError {
  constructor(details?: unknown) {
    super('A response from this student for this board question has already been submitted.', details);
    this.code = this.constructor.name;
  }
}
