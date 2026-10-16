export interface StartLessonPayload {
  lessonId: string;
  orgId: string;
  correlationId?: string;
}

export class StartLessonCommand {
  constructor(public readonly payload: StartLessonPayload) {}
}
