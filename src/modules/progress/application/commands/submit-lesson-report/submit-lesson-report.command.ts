export interface SubmitLessonReportPayload {
  reportId: string;
  correlationId?: string;
}

export class SubmitLessonReportCommand {
  constructor(public readonly payload: SubmitLessonReportPayload) {}
}
