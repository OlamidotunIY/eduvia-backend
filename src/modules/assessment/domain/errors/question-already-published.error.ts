import { ConflictError } from '@modules/shared';

export class QuestionAlreadyPublishedError extends ConflictError {
  constructor(questionId: string) {
    super(`Question with id "${questionId}" is already published.`);
    this.code = this.constructor.name;
  }
}
