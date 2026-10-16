import { BadRequestError } from '@modules/shared';

export class InvalidStudentResponseError extends BadRequestError {
  constructor(message = 'Invalid student response provided', details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}
