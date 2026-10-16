export interface RemoveAvailabilityExceptionPayload {
  orgId: string;
  teacherId: string;
  exceptionId: string;
}

export class RemoveAvailabilityExceptionCommand {
  constructor(public readonly payload: RemoveAvailabilityExceptionPayload) {}
}
