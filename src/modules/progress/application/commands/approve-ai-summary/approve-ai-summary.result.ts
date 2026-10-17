import { ReportStatus } from '../../../domain';

export interface ApproveAiSummaryResult {
  reportId: string;
  teacherApprovedAiSummary: string;
  status: ReportStatus;
}
