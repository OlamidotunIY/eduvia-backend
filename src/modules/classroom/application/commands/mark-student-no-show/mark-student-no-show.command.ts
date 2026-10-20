export interface MarkStudentNoShowPayload {
  lessonId: string;
  orgId: string;
  correlationId?: string;
}

export class MarkStudentNoShowCommand {
  constructor(public readonly payload: MarkStudentNoShowPayload) {}
}
