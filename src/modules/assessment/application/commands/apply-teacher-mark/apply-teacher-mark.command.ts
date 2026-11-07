export interface ApplyTeacherMarkPayload {
  orgId: string;
  assessmentId: string;
  markingItemId: string;
  marksAwarded: number;
  teacherId: string;
  feedback?: string | null;
  correlationId?: string;
}

export class ApplyTeacherMarkCommand {
  constructor(public readonly payload: ApplyTeacherMarkPayload) {}
}
