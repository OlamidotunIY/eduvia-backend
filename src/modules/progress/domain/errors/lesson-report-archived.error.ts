import { BusinessRuleViolationError } from '@modules/shared';

export class LessonReportArchivedError extends BusinessRuleViolationError {
  constructor(reportId: string) {
    super(`Cannot modify lesson report "${reportId}" because it has been archived.`);
    this.code = this.constructor.name;
  }
}
