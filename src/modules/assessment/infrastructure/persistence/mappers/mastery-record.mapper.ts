import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  MasteryRecord,
  MasteryRecordId,
} from '../../../domain';
import {
  MasteryRecord as PrismaMasteryRecord,
  MasteryHistoryEntry as PrismaMasteryHistoryEntry,
} from '@generated/prisma/client';
import { MasteryHistoryEntryMapper } from './mastery-history-entry.mapper';

@Injectable()
export class MasteryRecordMapper
  implements IMapper<MasteryRecord, PrismaMasteryRecord>
{
  constructor(private readonly entryMapper: MasteryHistoryEntryMapper) {}

  toDomain(
    record: PrismaMasteryRecord & { history?: PrismaMasteryHistoryEntry[] },
  ): MasteryRecord {
    const history = record.history
      ? record.history.map((h) => this.entryMapper.toDomain(h))
      : [];

    return MasteryRecord.reconstitute({
      id: MasteryRecordId.from(record.id),
      studentId: record.studentId,
      curriculumNodeId: record.curriculumNodeId,
      orgId: record.orgId,
      masteryLevel: record.masteryLevel,
      teacherAssessedScore: record.teacherAssessedScore,
      systemCalculatedScore: record.systemCalculatedScore,
      assessmentCount: record.assessmentCount,
      lastUpdatedAt: record.lastUpdatedAt,
      history,
    });
  }

  toPersistence(entity: MasteryRecord): Omit<PrismaMasteryRecord, 'id'> {
    return {
      studentId: entity.studentId,
      curriculumNodeId: entity.curriculumNodeId,
      orgId: entity.orgId,
      masteryLevel: entity.masteryLevel,
      teacherAssessedScore: entity.teacherAssessedScore,
      systemCalculatedScore: entity.systemCalculatedScore,
      assessmentCount: entity.assessmentCount,
      lastUpdatedAt: entity.lastUpdatedAt,
    };
  }
}
