export interface CompleteLessonPayload {
  lessonId: string;
  orgId: string;
  correlationId?: string;
}

export class CompleteLessonCommand {
  constructor(public readonly payload: CompleteLessonPayload) {}
}
