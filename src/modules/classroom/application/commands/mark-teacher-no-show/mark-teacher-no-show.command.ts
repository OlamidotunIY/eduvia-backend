export interface MarkTeacherNoShowPayload {
  lessonId: string;
  orgId: string;
  markedBy: string;
  correlationId?: string;
}

export class MarkTeacherNoShowCommand {
  constructor(public readonly payload: MarkTeacherNoShowPayload) {}
}
