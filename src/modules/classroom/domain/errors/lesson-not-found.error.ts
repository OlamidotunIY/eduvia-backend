import { NotFoundError } from '@modules/shared/domain';

export class LessonNotFoundError extends NotFoundError {
  constructor(details?: unknown) {
    super('Lesson not found', details);
    this.code = this.constructor.name;
  }
}
