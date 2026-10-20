export interface CancelLessonPayload {
  lessonId: string;
  orgId: string;
  reason: string;
  cancelledBy: string;
  correlationId?: string;
}

export class CancelLessonCommand {
  constructor(public readonly payload: CancelLessonPayload) {}
}
