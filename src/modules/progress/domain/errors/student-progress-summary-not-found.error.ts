import { NotFoundError } from '@modules/shared';

export class StudentProgressSummaryNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Student progress summary for "${identifier}" was not found.`);
    this.code = this.constructor.name;
  }
}
