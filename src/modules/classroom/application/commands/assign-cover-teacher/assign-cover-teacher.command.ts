export interface AssignCoverTeacherPayload {
  lessonId: string;
  orgId: string;
  coverTeacherId: string;
  correlationId?: string;
}

export class AssignCoverTeacherCommand {
  constructor(public readonly payload: AssignCoverTeacherPayload) {}
}
