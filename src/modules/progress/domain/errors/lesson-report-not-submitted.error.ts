import { BusinessRuleViolationError } from '@modules/shared';

export class LessonReportNotSubmittedError extends BusinessRuleViolationError {
  constructor(reportId: string, action: string) {
    super(`Cannot perform "${action}" because lesson report "${reportId}" is not yet submitted.`);
    this.code = this.constructor.name;
  }
}
