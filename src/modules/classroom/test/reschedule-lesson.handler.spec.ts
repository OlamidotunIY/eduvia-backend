import { RescheduleLessonHandler } from '../application/commands/reschedule-lesson/reschedule-lesson.handler';
import { RescheduleLessonCommand } from '../application/commands/reschedule-lesson/reschedule-lesson.command';
import {
  ILessonRepository,
  ITeacherAvailabilityRepository,
  InvalidLessonStateError,
  Lesson,
  LessonId,
  LessonNotFoundError,
  LessonOrigin,
  LessonRescheduledEvent,
  LessonStatus,
  ScheduleConflictError,
} from '../domain';

class MockLessonRepo implements Partial<ILessonRepository> {
  public lessons: Lesson[] = [];

  async findById(id: string | LessonId): Promise<Lesson | null> {
    const idVal = typeof id === 'string' ? id : id.value;
    return this.lessons.find((l) => l.id.value === idVal) ?? null;
  }

  async save(entity: Lesson): Promise<void> {
    const idx = this.lessons.findIndex((l) => l.id.value === entity.id.value);
    if (idx >= 0) {
      this.lessons[idx] = entity;
    } else {
      this.lessons.push(entity);
    }
  }

  async findConflictingLessons(
    orgId: string,
    teacherId: string,
    scheduledAt: Date,
    durationMins: number,
    excludeLessonId?: string,
  ): Promise<Lesson[]> {
    const newEnd = new Date(scheduledAt.getTime() + durationMins * 60000);
    return this.lessons.filter((l) => {
      if (l.orgId !== orgId || l.teacherId !== teacherId) return false;
      if (excludeLessonId && l.id.value === excludeLessonId) return false;
      if (l.status === LessonStatus.CANCELLED) return false;
      const curStart = l.scheduledAt;
      const curEnd = new Date(curStart.getTime() + l.durationMins * 60000);
      return scheduledAt < curEnd && newEnd > curStart;
    });
  }
}

class MockAvailabilityRepo implements Partial<ITeacherAvailabilityRepository> {
  async findByTeacherId(): Promise<any> {
    return null; // No custom availability restrictions
  }
}

describe('RescheduleLessonHandler', () => {
  let lessonRepo: MockLessonRepo;
  let availabilityRepo: MockAvailabilityRepo;
  let handler: RescheduleLessonHandler;

  const orgId = 'org-1';
  const teacherId = 'teacher-1';
  const classroomId = 'classroom-1';

  beforeEach(() => {
    lessonRepo = new MockLessonRepo();
    availabilityRepo = new MockAvailabilityRepo();
    handler = new RescheduleLessonHandler(
      lessonRepo as unknown as ILessonRepository,
      availabilityRepo as unknown as ITeacherAvailabilityRepository,
    );
  });

  it('should reschedule a scheduled lesson and emit LessonRescheduledEvent', async () => {
    const originalDate = new Date('2026-11-10T10:00:00.000Z');
    const lesson = Lesson.create({
      orgId,
      classroomId,
      teacherId,
      scheduledAt: originalDate,
      durationMins: 60,
      origin: LessonOrigin.RECURRING_GENERATION,
    });
    lesson.schedule();
    lesson.pullDomainEvents(); // Clear creation/scheduled events
    await lessonRepo.save(lesson);

    const newDate = new Date('2026-11-10T14:00:00.000Z');
    const result = await handler.execute(
      new RescheduleLessonCommand({
        orgId,
        lessonId: lesson.id.value,
        scheduledAt: newDate,
        durationMins: 45,
      }),
    );

    expect(result.success).toBe(true);
    expect(lesson.scheduledAt.getTime()).toBe(newDate.getTime());
    expect(lesson.durationMins).toBe(45);

    const events = lesson.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(LessonRescheduledEvent);
    const payload = events[0].payload as LessonRescheduledEvent.Payload;
    expect(payload.previousScheduledAt.getTime()).toBe(originalDate.getTime());
    expect(payload.newScheduledAt.getTime()).toBe(newDate.getTime());
    expect(payload.durationMins).toBe(45);
  });

  it('should reject rescheduling if lesson belongs to another org', async () => {
    const lesson = Lesson.create({
      orgId: 'different-org',
      classroomId,
      teacherId,
      scheduledAt: new Date('2026-11-10T10:00:00.000Z'),
      durationMins: 60,
    });
    await lessonRepo.save(lesson);

    await expect(
      handler.execute(
        new RescheduleLessonCommand({
          orgId,
          lessonId: lesson.id.value,
          scheduledAt: new Date('2026-11-10T14:00:00.000Z'),
        }),
      ),
    ).rejects.toThrow(LessonNotFoundError);
  });

  it('should reject rescheduling if conflicting lesson exists', async () => {
    const lesson1 = Lesson.create({
      orgId,
      classroomId,
      teacherId,
      scheduledAt: new Date('2026-11-10T10:00:00.000Z'),
      durationMins: 60,
    });
    lesson1.schedule();
    await lessonRepo.save(lesson1);

    const conflictingLesson = Lesson.create({
      orgId,
      classroomId: 'other-classroom',
      teacherId,
      scheduledAt: new Date('2026-11-10T14:00:00.000Z'),
      durationMins: 60,
    });
    conflictingLesson.schedule();
    await lessonRepo.save(conflictingLesson);

    // Try to reschedule lesson1 to overlap with conflictingLesson
    await expect(
      handler.execute(
        new RescheduleLessonCommand({
          orgId,
          lessonId: lesson1.id.value,
          scheduledAt: new Date('2026-11-10T14:30:00.000Z'),
          durationMins: 60,
        }),
      ),
    ).rejects.toThrow(ScheduleConflictError);
  });

  it('should reject rescheduling if lesson is not in PENDING or SCHEDULED state', async () => {
    const lesson = Lesson.create({
      orgId,
      classroomId,
      teacherId,
      scheduledAt: new Date('2026-11-10T10:00:00.000Z'),
      durationMins: 60,
    });
    lesson.cancel('User cancelled', 'user-1');
    await lessonRepo.save(lesson);

    await expect(
      handler.execute(
        new RescheduleLessonCommand({
          orgId,
          lessonId: lesson.id.value,
          scheduledAt: new Date('2026-11-10T14:00:00.000Z'),
        }),
      ),
    ).rejects.toThrow(InvalidLessonStateError);
  });
});
