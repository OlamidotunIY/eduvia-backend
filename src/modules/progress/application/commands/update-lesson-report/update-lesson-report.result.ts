import { ReportStatus } from '../../../domain';

export interface UpdateLessonReportResult {
  reportId: string;
  status: ReportStatus;
}
