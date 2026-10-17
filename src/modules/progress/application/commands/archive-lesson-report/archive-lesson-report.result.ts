import { ReportStatus } from '../../../domain';

export interface ArchiveLessonReportResult {
  reportId: string;
  status: ReportStatus;
  archivedAt: Date;
}
