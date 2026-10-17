export interface ArchiveLessonReportPayload {
  reportId: string;
  correlationId?: string;
}

export class ArchiveLessonReportCommand {
  constructor(public readonly payload: ArchiveLessonReportPayload) {}
}
