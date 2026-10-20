import { ReportStatus } from '../../../domain';

export interface CreateLessonReportResult {
  reportId: string;
  lessonId: string;
  status: ReportStatus;
}
