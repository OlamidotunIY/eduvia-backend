import { BusinessRuleViolationError } from '@modules/shared';

export class AssessmentAlreadyFinalizedError extends BusinessRuleViolationError {
  constructor(assessmentId: string) {
    super(`Assessment with id "${assessmentId}" has already been finalized.`);
    this.code = this.constructor.name;
  }
}
