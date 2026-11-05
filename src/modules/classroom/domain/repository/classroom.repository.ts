import { BaseRepository } from '@modules/shared/domain';
import { ClassroomId } from '../value-objects/classroom-id.vo';
import { Classroom } from '../model/classroom';

export abstract class IClassroomRepository extends BaseRepository<Classroom, ClassroomId> {
  public abstract findByOrgId(orgId: string): Promise<Classroom[]>;
  public abstract findByTeacherId(orgId: string, teacherId: string): Promise<Classroom[]>;
  public abstract findActive(): Promise<Classroom[]>;
}
