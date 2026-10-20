import { BaseRepository } from '@modules/shared';
import { MasteryRecordId } from '../value-objects';
import { MasteryRecord } from '../model/MasteryRecord';

export abstract class IMasteryRecordRepository extends BaseRepository<MasteryRecord, MasteryRecordId> {
  public abstract findByStudentAndNode(
    studentId: string,
    curriculumNodeId: string,
    orgId: string,
  ): Promise<MasteryRecord | null>;

  public abstract findByStudentId(
    studentId: string,
    orgId?: string,
  ): Promise<MasteryRecord[]>;
}
