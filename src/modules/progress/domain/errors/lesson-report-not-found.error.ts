import { NotFoundError } from '@modules/shared/domain';

export class LessonReportNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Lesson report "${identifier}" was not found.`);
    this.code = this.constructor.name;
  }
}
