export interface RemoveStudentPayload {
  classroomId: string;
  studentId: string;
  orgId: string;
  correlationId?: string;
}

export class RemoveStudentCommand {
  constructor(public readonly payload: RemoveStudentPayload) {}
}
