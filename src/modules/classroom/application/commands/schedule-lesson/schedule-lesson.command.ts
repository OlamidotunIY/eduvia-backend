export interface ScheduleLessonPayload {
  classroomId: string;
  orgId: string;
  scheduledAt: Date;
  durationMins?: number;
  teacherId?: string;
  isRecurring?: boolean;
  correlationId?: string;
}

export class ScheduleLessonCommand {
  constructor(public readonly payload: ScheduleLessonPayload) {}
}
