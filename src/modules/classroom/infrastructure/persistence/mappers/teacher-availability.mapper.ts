import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  TeacherAvailability,
  TeacherAvailabilityId,
  AvailabilitySlot,
  AvailabilitySlotId,
  AvailabilityException,
  AvailabilityExceptionId,
  ExceptionType,
} from '../../../domain';
import {
  TeacherAvailability as PrismaTeacherAvailability,
  AvailabilitySlot as PrismaSlot,
  AvailabilityException as PrismaException,
} from '@generated/prisma/client';

export type PrismaTeacherAvailabilityWithRelations = PrismaTeacherAvailability & {
  slots?: PrismaSlot[];
  exceptions?: PrismaException[];
};

@Injectable()
export class TeacherAvailabilityMapper
  implements IMapper<TeacherAvailability, PrismaTeacherAvailabilityWithRelations>
{
  toDomain(record: PrismaTeacherAvailabilityWithRelations): TeacherAvailability {
    const slots = (record.slots ?? []).map((s) =>
      AvailabilitySlot.reconstitute({
        id: AvailabilitySlotId.from(s.id),
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        timezone: s.timezone,
      }),
    );

    const exceptions = (record.exceptions ?? []).map((e) =>
      AvailabilityException.reconstitute({
        id: AvailabilityExceptionId.from(e.id),
        date: e.date,
        type: e.type as ExceptionType,
        startTime: e.startTime,
        endTime: e.endTime,
        reason: e.reason,
      }),
    );

    return TeacherAvailability.reconstitute({
      id: TeacherAvailabilityId.from(record.id),
      orgId: record.orgId,
      teacherId: record.teacherId,
      slots,
      exceptions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(
    entity: TeacherAvailability,
  ): Omit<PrismaTeacherAvailability, 'id'> {
    return {
      orgId: entity.orgId,
      teacherId: entity.teacherId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
