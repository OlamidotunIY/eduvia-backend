export interface ReopenClassroomPayload {
  classroomId: string;
  orgId: string;
}

export class ReopenClassroomCommand {
  constructor(public readonly payload: ReopenClassroomPayload) {}
}
