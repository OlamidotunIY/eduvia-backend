import { ForbiddenError } from '@modules/shared';

export class InsufficientQuestionPermissionError extends ForbiddenError {
  constructor(message = 'You do not have permission to modify or delete this question.') {
    super(message);
    this.code = this.constructor.name;
  }
}
