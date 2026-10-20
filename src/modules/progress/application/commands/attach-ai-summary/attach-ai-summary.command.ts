export interface AttachAiSummaryPayload {
  reportId: string;
  aiGeneratedSummary: string;
  correlationId?: string;
}

export class AttachAiSummaryCommand {
  constructor(public readonly payload: AttachAiSummaryPayload) {}
}
