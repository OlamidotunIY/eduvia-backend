import { BaseRepository } from '@modules/shared';
import { AssessmentId, AssessmentStatus } from '../value-objects';
import { Assessment } from '../model/Assessment';

export interface AssessmentFilter {
  orgId?: string;
  lessonId?: string;
  boardId?: string;
  studentId?: string;
  status?: AssessmentStatus;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface AssessmentSummary {
  total: number;
  pendingMarking: number;
  partiallyMarked: number;
  fullyMarked: number;
  averageScorePercent: number | null;
}

export abstract class IAssessmentRepository extends BaseRepository<Assessment, AssessmentId> {
  public abstract findByOrgId(
    orgId: string,
    filter?: AssessmentFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Assessment[]>;

  public abstract findByLessonAndStudent(
    lessonId: string,
    studentId: string,
  ): Promise<Assessment | null>;

  public abstract findByStudentId(
    studentId: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<Assessment[]>;

  public abstract countByOrgId(
    orgId: string,
    filter?: AssessmentFilter,
  ): Promise<number>;

  public abstract getSummaryByOrgId(
    orgId: string,
    filter?: AssessmentFilter,
  ): Promise<AssessmentSummary>;
}
