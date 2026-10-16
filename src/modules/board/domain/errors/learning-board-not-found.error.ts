import { NotFoundError } from '@modules/shared';

export class LearningBoardNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Learning board not found', details);
    this.code = this.constructor.name;
  }
}
