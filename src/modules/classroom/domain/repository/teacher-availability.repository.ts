import { BaseRepository } from '@modules/shared';
import { TeacherAvailabilityId } from '../value-objects/teacher-availability-id.vo';
import { TeacherAvailability } from '../model/TeacherAvailability';

export abstract class ITeacherAvailabilityRepository extends BaseRepository<
  TeacherAvailability,
  TeacherAvailabilityId
> {
  public abstract findByTeacherId(
    orgId: string,
    teacherId: string,
  ): Promise<TeacherAvailability | null>;
}
