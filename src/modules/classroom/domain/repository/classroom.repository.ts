import { BaseRepository } from '@modules/shared';
import { ClassroomId } from '../value-objects/classroom-id.vo';
import { Classroom } from '../model/Classroom';

export abstract class IClassroomRepository extends BaseRepository<Classroom, ClassroomId> {
  public abstract findByOrgId(orgId: string): Promise<Classroom[]>;
  public abstract findByTeacherId(orgId: string, teacherId: string): Promise<Classroom[]>;
}
