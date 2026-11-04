export class CreateClassroomDto {
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  lessonDurationMins: number;
  maxStudents?: number;
  recurrenceDaysOfWeek?: number[];
  /** @deprecated Use recurrenceDaysOfWeek. */
  recurrenceDayOfWeek?: number;
  recurrenceStartTime: string;
  recurrenceTimezone: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom: string;
  recurrenceEffectiveUntil?: string | null;
}
