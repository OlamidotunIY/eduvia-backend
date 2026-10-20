export interface EnrollStudentPayload {
  classroomId: string;
  studentId: string;
  orgId: string;
  correlationId?: string;
}

export class EnrollStudentCommand {
  constructor(public readonly payload: EnrollStudentPayload) {}
}
