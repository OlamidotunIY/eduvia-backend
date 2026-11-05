export interface RescheduleLessonPayload {
  lessonId: string;
  orgId: string;
  scheduledAt: Date;
  durationMins?: number;
  correlationId?: string;
}

export class RescheduleLessonCommand {
  constructor(public readonly payload: RescheduleLessonPayload) {}
}
