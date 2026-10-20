import { ReportStatus } from '../../../domain';

export interface SubmitLessonReportResult {
  reportId: string;
  status: ReportStatus;
  parentCanView: boolean;
  submittedAt: Date;
}
