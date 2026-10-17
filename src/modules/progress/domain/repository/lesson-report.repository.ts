import { BaseRepository } from '@modules/shared';
import { LessonReportId, ReportStatus } from '../value-objects';
import { LessonReport } from '../model/LessonReport';

export interface LessonReportFilter {
  orgId?: string;
  classroomId?: string;
  teacherId?: string;
  studentId?: string;
  status?: ReportStatus;
  parentCanView?: boolean;
}

export abstract class ILessonReportRepository extends BaseRepository<LessonReport, LessonReportId> {
  public abstract findByLessonId(lessonId: string): Promise<LessonReport | null>;
  public abstract findByOrgId(
    orgId: string,
    filter?: LessonReportFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReport[]>;
  public abstract findByStudentId(
    studentId: string,
    orgId?: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReport[]>;
  public abstract findSubmittedByStudent(
    studentId: string,
    orgId?: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<LessonReport[]>;
  public abstract findArchivableReports(cutoffDate: Date): Promise<LessonReport[]>;
}
