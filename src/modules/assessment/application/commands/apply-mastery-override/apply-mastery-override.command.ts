export interface ApplyMasteryOverridePayload {
  studentId: string;
  curriculumNodeId: string;
  orgId: string;
  score: number;
  correlationId?: string;
}

export class ApplyMasteryOverrideCommand {
  constructor(public readonly payload: ApplyMasteryOverridePayload) {}
}
