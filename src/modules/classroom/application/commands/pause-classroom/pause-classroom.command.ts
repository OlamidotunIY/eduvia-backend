export interface PauseClassroomPayload {
  classroomId: string;
  orgId: string;
  correlationId?: string;
}

export class PauseClassroomCommand {
  constructor(public readonly payload: PauseClassroomPayload) {}
}
