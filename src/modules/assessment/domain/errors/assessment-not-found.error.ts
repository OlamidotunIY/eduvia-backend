import { NotFoundError } from '@modules/shared';

export class AssessmentNotFoundError extends NotFoundError {
  constructor(assessmentId: string) {
    super(`Assessment with id "${assessmentId}" was not found.`);
    this.code = this.constructor.name;
  }
}
