import { Injectable, Logger } from '@nestjs/common';
import {
  Classroom,
  ILessonRepository,
  Lesson,
  LessonOrigin,
  LessonStatus,
} from '../../domain';
import { calculateRecurringOccurrences } from '../../domain/services/classroom-scheduler.util';

@Injectable()
export class ClassroomLessonMaterializer {
  private readonly logger = new Logger(ClassroomLessonMaterializer.name);

  constructor(private readonly lessonRepository: ILessonRepository) {}

  /**
   * Generates recurring occurrences for a classroom from recurrence start up to the eight-week horizon.
   * Completely idempotent: existing occurrences are skipped.
   */
  async materializeClassroom(
    classroom: Classroom,
    options?: { horizonWeeks?: number; fromDate?: Date },
  ): Promise<{ createdCount: number }> {
    const horizonWeeks = options?.horizonWeeks ?? 8;
    const now = new Date();
    const horizonEnd = new Date(
      now.getTime() + horizonWeeks * 7 * 24 * 60 * 60 * 1000,
    );

    const startLimit = options?.fromDate ?? classroom.recurrence.effectiveFrom;

    const targetDates = calculateRecurringOccurrences({
      daysOfWeek: classroom.recurrence.daysOfWeek,
      startTime: classroom.recurrence.startTime,
      timeZone: classroom.recurrence.timezone,
      intervalWeeks: classroom.recurrence.intervalWeeks,
      effectiveFrom: classroom.recurrence.effectiveFrom,
      effectiveUntil: classroom.recurrence.effectiveUntil,
      startLimit,
      endLimit: horizonEnd,
    });

    if (targetDates.length === 0) {
      return { createdCount: 0 };
    }

    const existingLessons = await this.lessonRepository.findByClassroomId(
      classroom.orgId,
      classroom.id.value,
    );

    const existingTimestampSet = new Set(
      existingLessons.map((l) => l.scheduledAt.getTime()),
    );

    let createdCount = 0;
    for (const occurrenceDate of targetDates) {
      if (existingTimestampSet.has(occurrenceDate.getTime())) {
        continue;
      }

      const lesson = Lesson.create({
        orgId: classroom.orgId,
        classroomId: classroom.id.value,
        teacherId: classroom.primaryTeacherId,
        scheduledAt: occurrenceDate,
        durationMins: classroom.lessonDurationMins,
        isRecurring: true,
        origin: LessonOrigin.RECURRING_GENERATION,
      });

      lesson.schedule();
      await this.lessonRepository.save(lesson);
      existingTimestampSet.add(occurrenceDate.getTime());
      createdCount++;
    }

    if (createdCount > 0) {
      this.logger.log(
        `Materialized ${createdCount} recurring lessons for classroom ${classroom.id.value}`,
      );
    }

    return { createdCount };
  }

  /**
   * Reconciles future generated lessons when a classroom's recurrence pattern is updated.
   * - Untouched future occurrences that no longer match the pattern are removed/cancelled.
   * - Newly required occurrences are created.
   * - Historical, started, completed, cancelled, or one-off lessons are preserved intact.
   */
  async reconcileClassroomRecurrence(
    classroom: Classroom,
    options?: { horizonWeeks?: number },
  ): Promise<{ createdCount: number; removedCount: number }> {
    const horizonWeeks = options?.horizonWeeks ?? 8;
    const now = new Date();
    const horizonEnd = new Date(
      now.getTime() + horizonWeeks * 7 * 24 * 60 * 60 * 1000,
    );

    // Calculate new expected future occurrences
    const expectedFutureDates = calculateRecurringOccurrences({
      daysOfWeek: classroom.recurrence.daysOfWeek,
      startTime: classroom.recurrence.startTime,
      timeZone: classroom.recurrence.timezone,
      intervalWeeks: classroom.recurrence.intervalWeeks,
      effectiveFrom: classroom.recurrence.effectiveFrom,
      effectiveUntil: classroom.recurrence.effectiveUntil,
      startLimit: now,
      endLimit: horizonEnd,
    });

    const expectedTimestamps = new Set(
      expectedFutureDates.map((d) => d.getTime()),
    );

    const existingLessons = await this.lessonRepository.findByClassroomId(
      classroom.orgId,
      classroom.id.value,
    );

    let removedCount = 0;
    for (const lesson of existingLessons) {
      // Only process future recurring occurrences generated from pattern
      if (
        lesson.scheduledAt > now &&
        lesson.origin === LessonOrigin.RECURRING_GENERATION
      ) {
        const stillMatches = expectedTimestamps.has(
          lesson.scheduledAt.getTime(),
        );

        if (!stillMatches) {
          if (lesson.status === LessonStatus.PENDING && !lesson.meetingId) {
            await this.lessonRepository.delete(lesson.id);
            removedCount++;
          } else if (lesson.status === LessonStatus.SCHEDULED) {
            lesson.cancel('Classroom recurrence updated', 'SYSTEM');
            await this.lessonRepository.save(lesson);
            removedCount++;
          }
        }
      }
    }

    // Materialize newly required occurrences
    const { createdCount } = await this.materializeClassroom(classroom, {
      horizonWeeks,
      fromDate: now,
    });

    this.logger.log(
      `Reconciled classroom ${classroom.id.value}: ${createdCount} created, ${removedCount} removed/cancelled`,
    );

    return { createdCount, removedCount };
  }
}
