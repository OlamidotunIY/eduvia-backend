export interface UpdateClassroomPayload {
  classroomId: string;
  orgId: string;
  name?: string;
  lessonDurationMins?: number;
  maxStudents?: number;
  primaryTeacherId?: string;
  correlationId?: string;
}

export class UpdateClassroomCommand {
  constructor(public readonly payload: UpdateClassroomPayload) {}
}
