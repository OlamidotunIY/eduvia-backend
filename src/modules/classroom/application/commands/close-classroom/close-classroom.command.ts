export interface CloseClassroomPayload {
  classroomId: string;
  orgId: string;
  correlationId?: string;
}

export class CloseClassroomCommand {
  constructor(public readonly payload: CloseClassroomPayload) {}
}
