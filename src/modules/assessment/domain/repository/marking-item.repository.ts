import { BaseRepository } from '@modules/shared';
import { MarkingItemId } from '../value-objects';
import { MarkingItem } from '../entities/marking-item.entity';

export abstract class IMarkingItemRepository extends BaseRepository<MarkingItem, MarkingItemId> {
  public abstract findByAssessmentId(assessmentId: string): Promise<MarkingItem[]>;
  public abstract findPendingByTeacher(
    teacherId: string,
    orgId: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<MarkingItem[]>;
}
