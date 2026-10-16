export class CreateClassroomDto {
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  lessonDurationMins: number;
  maxStudents?: number;
  recurrenceDayOfWeek: number;
  recurrenceStartTime: string;
  recurrenceTimezone: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom: string;
  recurrenceEffectiveUntil?: string | null;
}
