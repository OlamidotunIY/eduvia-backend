import { BaseRepository } from '@modules/shared';
import { TeacherProfile } from '../entities';
import { TeacherProfileId, UserId } from '../value-objects';

abstract class ITeacherProfileRepository extends BaseRepository<
  TeacherProfile,
  TeacherProfileId
> {
  public abstract findByUserId(userId: UserId): Promise<TeacherProfile | null>;
}

export { ITeacherProfileRepository };
