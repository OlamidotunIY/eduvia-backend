import { BusinessRuleViolationError } from '@modules/shared';

export class QuestionCannotBeDeletedError extends BusinessRuleViolationError {
  constructor(questionId: string, usageCount: number) {
    super(`Question with id "${questionId}" cannot be deleted because it has been used in ${usageCount} lesson(s).`);
    this.code = this.constructor.name;
  }
}
