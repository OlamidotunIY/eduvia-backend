import { BadRequestError } from '@modules/shared';

export class InvalidTeacherMarkError extends BadRequestError {
  constructor(message = 'Invalid teacher mark provided', details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}
