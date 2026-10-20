export interface MarkStudentResponsePayload {
  responseId: string;
  marksAwarded: number;
  maxMarks: number;
  markedBy: string;
  feedback?: string | null;
  correlationId?: string;
}

export class MarkStudentResponseCommand {
  constructor(public readonly payload: MarkStudentResponsePayload) {}
}
