import { BaseRepository } from '@modules/shared';
import { ParentProfile } from '../entities';
import { ParentProfileId, UserId } from '../value-objects';

abstract class IParentProfileRepository extends BaseRepository<
  ParentProfile,
  ParentProfileId
> {
  public abstract findByUserId(userId: UserId): Promise<ParentProfile | null>;
}

export { IParentProfileRepository };
