export class UpdateClassroomDto {
  name?: string;
  lessonDurationMins?: number;
  maxStudents?: number;
  primaryTeacherId?: string;
  recurrenceDaysOfWeek?: number[];
  /** @deprecated Use recurrenceDaysOfWeek. */
  recurrenceDayOfWeek?: number;
  recurrenceStartTime?: string;
  recurrenceTimezone?: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom?: string;
  recurrenceEffectiveUntil?: string | null;
}
