export interface UpdateClassroomPayload {
  classroomId: string;
  orgId: string;
  name?: string;
  lessonDurationMins?: number;
  maxStudents?: number;
  primaryTeacherId?: string;
  recurrenceDaysOfWeek?: number[];
  recurrenceStartTime?: string;
  recurrenceTimezone?: string;
  recurrenceIntervalWeeks?: number;
  recurrenceEffectiveFrom?: Date;
  recurrenceEffectiveUntil?: Date | null;
  correlationId?: string;
}

export class UpdateClassroomCommand {
  constructor(public readonly payload: UpdateClassroomPayload) {}
}
