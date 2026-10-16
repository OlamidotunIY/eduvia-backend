export interface CreateClassroomPayload {
  orgId: string;
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  lessonDurationMins: number;
  maxStudents?: number;
  recurrenceDayOfWeek: number;
  recurrenceStartTime: string;
  recurrenceTimezone: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom: Date;
  recurrenceEffectiveUntil?: Date | null;
  correlationId?: string;
}

export class CreateClassroomCommand {
  constructor(public readonly payload: CreateClassroomPayload) {}
}
