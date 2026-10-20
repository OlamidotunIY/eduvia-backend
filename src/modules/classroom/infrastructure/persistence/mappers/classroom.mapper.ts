import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Classroom,
  ClassroomId,
  ClassroomStatus,
  RecurrencePattern,
} from '../../../domain';
import { Classroom as PrismaClassroom } from '@generated/prisma/client';

@Injectable()
export class ClassroomMapper implements IMapper<Classroom, PrismaClassroom> {
  toDomain(record: PrismaClassroom): Classroom {
    return Classroom.reconstitute({
      id: ClassroomId.from(record.id),
      orgId: record.orgId,
      name: record.name,
      subjectId: record.subjectId,
      primaryTeacherId: record.primaryTeacherId,
      status: record.status as ClassroomStatus,
      lessonDurationMins: record.lessonDurationMins,
      maxStudents: record.maxStudents,
      recurrence: RecurrencePattern.create({
        dayOfWeek: record.recurrenceDayOfWeek,
        startTime: record.recurrenceStartTime,
        timezone: record.recurrenceTimezone,
        intervalWeeks: record.recurrenceIntervalWeeks,
        effectiveFrom: record.recurrenceEffectiveFrom,
        effectiveUntil: record.recurrenceEffectiveUntil,
      }),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Classroom): Omit<PrismaClassroom, 'id'> {
    return {
      orgId: entity.orgId,
      name: entity.name,
      subjectId: entity.subjectId,
      primaryTeacherId: entity.primaryTeacherId,
      status: entity.status,
      lessonDurationMins: entity.lessonDurationMins,
      maxStudents: entity.maxStudents,
      recurrenceDayOfWeek: entity.recurrence.dayOfWeek,
      recurrenceStartTime: entity.recurrence.startTime,
      recurrenceTimezone: entity.recurrence.timezone,
      recurrenceIntervalWeeks: entity.recurrence.intervalWeeks,
      recurrenceEffectiveFrom: entity.recurrence.effectiveFrom,
      recurrenceEffectiveUntil: entity.recurrence.effectiveUntil,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
