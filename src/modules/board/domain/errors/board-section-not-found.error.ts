import { NotFoundError } from '@modules/shared';

export class BoardSectionNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Board section not found', details);
    this.code = this.constructor.name;
  }
}
