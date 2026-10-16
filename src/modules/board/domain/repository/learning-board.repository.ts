import { BaseRepository } from '@modules/shared';
import { LearningBoardId } from '../value-objects';
import { LearningBoard } from '../model/LearningBoard';

export abstract class ILearningBoardRepository extends BaseRepository<LearningBoard, LearningBoardId> {
  public abstract findByLessonId(lessonId: string): Promise<LearningBoard | null>;
  public abstract findByOrgId(orgId: string, pagination?: { skip?: number; take?: number }): Promise<LearningBoard[]>;
}
