export interface FinalizeAssessmentPayload {
  orgId: string;
  assessmentId: string;
  curriculumNodeId?: string | null;
  correlationId?: string;
}

export class FinalizeAssessmentCommand {
  constructor(public readonly payload: FinalizeAssessmentPayload) {}
}
