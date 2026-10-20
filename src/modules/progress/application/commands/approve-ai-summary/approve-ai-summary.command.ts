export interface ApproveAiSummaryPayload {
  reportId: string;
  editedSummary?: string;
}

export class ApproveAiSummaryCommand {
  constructor(public readonly payload: ApproveAiSummaryPayload) {}
}
