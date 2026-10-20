import { ForbiddenError } from '@modules/shared/domain';

export class UnauthorizedCommentAuthorError extends ForbiddenError {
  constructor(role: string) {
    super(`Role "${role}" is not authorized to comment on a lesson report. Only parents and admins are permitted.`);
    this.code = this.constructor.name;
  }
}
