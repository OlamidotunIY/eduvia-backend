import { BaseRepository } from '@modules/shared';
import { SubjectCurriculumMappingId } from '../value-objects';
import { SubjectCurriculumMapping } from '../entities';

export abstract class ISubjectCurriculumMappingRepository extends BaseRepository<SubjectCurriculumMapping, SubjectCurriculumMappingId> {
  public abstract findBySubjectAndCurriculum(
    platformSubjectId: string,
    curriculumId: string,
  ): Promise<SubjectCurriculumMapping | null>;

  public abstract findByCurriculumId(
    curriculumId: string,
  ): Promise<SubjectCurriculumMapping[]>;

  public abstract findByPlatformSubjectId(
    platformSubjectId: string,
  ): Promise<SubjectCurriculumMapping[]>;
}
