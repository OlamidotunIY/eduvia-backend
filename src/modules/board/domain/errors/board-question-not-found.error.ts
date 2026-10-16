import { NotFoundError } from '@modules/shared';

export class BoardQuestionNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Board question not found', details);
    this.code = this.constructor.name;
  }
}
