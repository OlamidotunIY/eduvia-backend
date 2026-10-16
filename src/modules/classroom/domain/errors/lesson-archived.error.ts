import { ConflictError } from '@modules/shared';

export class LessonArchivedError extends ConflictError {
  constructor(details?: unknown) {
    super('Lesson is archived and cannot be modified', details);
    this.code = this.constructor.name;
  }
}
