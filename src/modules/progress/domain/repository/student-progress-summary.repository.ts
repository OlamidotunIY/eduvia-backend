import { BaseRepository } from '@modules/shared/domain';
import { StudentProgressSummaryId } from '../value-objects';
import { StudentProgressSummary } from '../model/StudentProgressSummary';

export abstract class IStudentProgressSummaryRepository extends BaseRepository<
  StudentProgressSummary,
  StudentProgressSummaryId
> {
  public abstract findByStudentAndSubject(
    studentId: string,
    orgId: string,
    subjectId: string,
  ): Promise<StudentProgressSummary | null>;

  public abstract findAllByStudent(
    studentId: string,
    orgId?: string,
  ): Promise<StudentProgressSummary[]>;

  public abstract findByOrg(orgId: string): Promise<StudentProgressSummary[]>;
}
