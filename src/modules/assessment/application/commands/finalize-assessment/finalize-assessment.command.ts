export interface FinalizeAssessmentPayload {
  assessmentId: string;
  curriculumNodeId?: string | null;
  correlationId?: string;
}

export class FinalizeAssessmentCommand {
  constructor(public readonly payload: FinalizeAssessmentPayload) {}
}
