export interface CreateAssessmentPayload {
  orgId: string;
  lessonId: string;
  boardId: string;
  studentId: string;
  correlationId?: string;
}

export class CreateAssessmentCommand {
  constructor(public readonly payload: CreateAssessmentPayload) {}
}
