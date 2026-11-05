import { ClassroomLessonMaterializer } from '../application/services/classroom-lesson-materializer.service';
import {
  Classroom,
  ClassroomId,
  ILessonRepository,
  Lesson,
  LessonId,
  LessonOrigin,
  LessonStatus,
  RecurrencePattern,
} from '../domain';

class MockLessonRepository implements Partial<ILessonRepository> {
  public lessons: Lesson[] = [];

  async findByClassroomId(
    orgId: string,
    classroomId: string,
    dateRange?: { fromDate?: Date; toDate?: Date },
  ): Promise<Lesson[]> {
    return this.lessons.filter((l) => {
      if (l.orgId !== orgId || l.classroomId !== classroomId) return false;
      if (dateRange?.fromDate && l.scheduledAt < dateRange.fromDate) return false;
      if (dateRange?.toDate && l.scheduledAt > dateRange.toDate) return false;
      return true;
    });
  }

  async save(entity: Lesson): Promise<void> {
    const idx = this.lessons.findIndex((l) => l.id.value === entity.id.value);
    if (idx >= 0) {
      this.lessons[idx] = entity;
    } else {
      this.lessons.push(entity);
    }
  }

  async delete(id: string | LessonId): Promise<void> {
    const idVal = typeof id === 'string' ? id : id.value;
    this.lessons = this.lessons.filter((l) => l.id.value !== idVal);
  }
}

describe('ClassroomLessonMaterializer', () => {
  let mockRepo: MockLessonRepository;
  let materializer: ClassroomLessonMaterializer;

  const orgId = 'org-123';
  const primaryTeacherId = 'teacher-123';
  const subjectId = 'subject-123';

  beforeEach(() => {
    mockRepo = new MockLessonRepository();
    materializer = new ClassroomLessonMaterializer(
      mockRepo as unknown as ILessonRepository,
    );
  });

  it('should materialize occurrences and be idempotent on second run', async () => {
    // Effective from next Monday
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + 7);
    nextMonday.setHours(0, 0, 0, 0);

    const recurrence = RecurrencePattern.create({
      daysOfWeek: [1], // Monday only
      startTime: '10:00',
      timezone: 'UTC',
      intervalWeeks: 1,
      effectiveFrom: nextMonday,
    });

    const classroom = Classroom.create({
      orgId,
      name: 'Physics',
      subjectId,
      primaryTeacherId,
      lessonDurationMins: 60,
      recurrence,
    });

    const res1 = await materializer.materializeClassroom(classroom, {
      horizonWeeks: 8,
    });
    expect(res1.createdCount).toBeGreaterThanOrEqual(7);
    const initialLessonCount = mockRepo.lessons.length;

    // Verify origin and status
    for (const l of mockRepo.lessons) {
      expect(l.origin).toBe(LessonOrigin.RECURRING_GENERATION);
      expect(l.status).toBe(LessonStatus.SCHEDULED);
      expect(l.durationMins).toBe(60);
      expect(l.teacherId).toBe(primaryTeacherId);
    }

    // Second run should be idempotent
    const res2 = await materializer.materializeClassroom(classroom, {
      horizonWeeks: 8,
    });
    expect(res2.createdCount).toBe(0);
    expect(mockRepo.lessons.length).toBe(initialLessonCount);
  });

  it('should reconcile future occurrences when recurrence is updated', async () => {
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + 7);
    nextMonday.setHours(0, 0, 0, 0);

    const recurrenceMon = RecurrencePattern.create({
      daysOfWeek: [1],
      startTime: '10:00',
      timezone: 'UTC',
      intervalWeeks: 1,
      effectiveFrom: nextMonday,
    });

    const classroom = Classroom.create({
      orgId,
      name: 'Chemistry',
      subjectId,
      primaryTeacherId,
      lessonDurationMins: 45,
      recurrence: recurrenceMon,
    });

    await materializer.materializeClassroom(classroom, { horizonWeeks: 4 });
    const mondayCount = mockRepo.lessons.length;
    expect(mondayCount).toBeGreaterThan(0);

    // Also add a one-off lesson that should NOT be removed
    const oneOffDate = new Date(nextMonday.getTime() + 2 * 24 * 60 * 60 * 1000); // Wednesday
    const oneOffLesson = Lesson.create({
      orgId,
      classroomId: classroom.id.value,
      teacherId: primaryTeacherId,
      scheduledAt: oneOffDate,
      durationMins: 45,
      origin: LessonOrigin.ONE_OFF,
      isRecurring: false,
    });
    await mockRepo.save(oneOffLesson);

    // Now update recurrence to Fridays
    const recurrenceFri = RecurrencePattern.create({
      daysOfWeek: [5],
      startTime: '14:00',
      timezone: 'UTC',
      intervalWeeks: 1,
      effectiveFrom: nextMonday,
    });
    classroom.updateRecurrence(recurrenceFri);

    const reconcileRes = await materializer.reconcileClassroomRecurrence(
      classroom,
      { horizonWeeks: 4 },
    );

    expect(reconcileRes.removedCount).toBe(mondayCount);
    expect(reconcileRes.createdCount).toBeGreaterThan(0);

    // Verify one-off lesson was NOT removed
    const foundOneOff = mockRepo.lessons.find(
      (l) => l.id.value === oneOffLesson.id.value,
    );
    expect(foundOneOff).toBeDefined();
    expect(foundOneOff?.origin).toBe(LessonOrigin.ONE_OFF);
  });
});
