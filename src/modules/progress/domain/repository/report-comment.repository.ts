import { BaseRepository } from '@modules/shared';
import { ReportCommentId } from '../value-objects';
import { ReportComment } from '../entities';

export abstract class IReportCommentRepository extends BaseRepository<ReportComment, ReportCommentId> {
  public abstract findByReportId(reportId: string): Promise<ReportComment[]>;
}
