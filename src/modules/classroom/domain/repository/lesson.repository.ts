import { BaseRepository } from '@modules/shared';
import { LessonId } from '../value-objects/lesson-id.vo';
import { LessonStatus } from '../value-objects/lesson-status.vo';
import { Lesson } from '../model/Lesson';

export interface LessonFilters {
  status?: LessonStatus;
  teacherId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export abstract class ILessonRepository extends BaseRepository<Lesson, LessonId> {
  public abstract findByClassroomId(orgId: string, classroomId: string): Promise<Lesson[]>;
  public abstract findByOrgId(orgId: string, filters?: LessonFilters): Promise<Lesson[]>;
  public abstract findConflictingLessons(
    orgId: string,
    teacherId: string,
    scheduledAt: Date,
    durationMins: number,
    excludeLessonId?: string,
  ): Promise<Lesson[]>;
  public abstract findReportedOlderThan(date: Date): Promise<Lesson[]>;
}
