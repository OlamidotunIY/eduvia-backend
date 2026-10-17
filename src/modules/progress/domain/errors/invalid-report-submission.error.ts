import { BusinessRuleViolationError } from '@modules/shared';

export class InvalidReportSubmissionError extends BusinessRuleViolationError {
  constructor(reportId: string, reason?: string) {
    super(
      reason ||
        `Lesson report "${reportId}" cannot be submitted without at least one of: teacher narrative or approved AI summary.`,
    );
    this.code = this.constructor.name;
  }
}
