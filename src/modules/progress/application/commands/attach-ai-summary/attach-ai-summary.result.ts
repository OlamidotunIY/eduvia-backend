import { ReportStatus } from '../../../domain';

export interface AttachAiSummaryResult {
  reportId: string;
  status: ReportStatus;
}
