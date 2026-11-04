export class UpdateClassroomDto {
  name?: string;
  lessonDurationMins?: number;
  maxStudents?: number;
  primaryTeacherId?: string;
  recurrenceDayOfWeek?: number;
  recurrenceStartTime?: string;
  recurrenceTimezone?: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom?: string;
  recurrenceEffectiveUntil?: string | null;
}
