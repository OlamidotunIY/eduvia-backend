import { ConflictError } from '@modules/shared/domain';

export class LessonReportAlreadySubmittedError extends ConflictError {
  constructor(reportId: string) {
    super(`Lesson report "${reportId}" has already been submitted.`);
    this.code = this.constructor.name;
  }
}
