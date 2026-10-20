import { NotFoundError } from '@modules/shared/domain';

export class ReportCommentNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Report comment "${identifier}" was not found.`);
    this.code = this.constructor.name;
  }
}
