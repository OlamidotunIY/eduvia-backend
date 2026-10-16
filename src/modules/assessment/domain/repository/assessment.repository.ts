import { BaseRepository } from '@modules/shared';
import { AssessmentId, AssessmentStatus } from '../value-objects';
import { Assessment } from '../model/Assessment';

export interface AssessmentFilter {
  orgId?: string;
  lessonId?: string;
  boardId?: string;
  studentId?: string;
  status?: AssessmentStatus;
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
}
