import { BusinessRuleViolationError } from '@modules/shared';

export class InvalidQuestionTypeError extends BusinessRuleViolationError {
  constructor(message = 'Invalid question type or configuration for this question.') {
    super(message);
    this.code = this.constructor.name;
  }
}
