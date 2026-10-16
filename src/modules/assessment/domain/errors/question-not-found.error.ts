import { NotFoundError } from '@modules/shared';

export class QuestionNotFoundError extends NotFoundError {
  constructor(questionId: string) {
    super(`Question with id "${questionId}" was not found.`);
    this.code = this.constructor.name;
  }
}
