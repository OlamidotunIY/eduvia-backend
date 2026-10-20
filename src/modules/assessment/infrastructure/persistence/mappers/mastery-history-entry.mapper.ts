import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  MasteryHistoryEntry,
  MasteryHistoryEntryId,
  MasteryTrigger,
} from '../../../domain';
import { MasteryHistoryEntry as PrismaMasteryHistoryEntry } from '@generated/prisma/client';

@Injectable()
export class MasteryHistoryEntryMapper
  implements IMapper<MasteryHistoryEntry, PrismaMasteryHistoryEntry>
{
  toDomain(record: PrismaMasteryHistoryEntry): MasteryHistoryEntry {
    return MasteryHistoryEntry.reconstitute({
      id: MasteryHistoryEntryId.from(record.id),
      masteryRecordId: record.masteryRecordId,
      masteryLevel: record.masteryLevel,
      trigger: record.trigger as MasteryTrigger,
      lessonId: record.lessonId,
      recordedAt: record.recordedAt,
    });
  }

  toPersistence(
    entity: MasteryHistoryEntry,
  ): Omit<PrismaMasteryHistoryEntry, 'id'> {
    return {
      masteryRecordId: entity.masteryRecordId,
      masteryLevel: entity.masteryLevel,
      trigger: entity.trigger as any,
      lessonId: entity.lessonId,
      recordedAt: entity.recordedAt,
    };
  }
}
