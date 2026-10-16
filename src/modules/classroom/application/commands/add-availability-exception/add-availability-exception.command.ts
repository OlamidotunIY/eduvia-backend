import { ExceptionType } from '../../../domain';

export interface AddAvailabilityExceptionPayload {
  orgId: string;
  teacherId: string;
  date: Date;
  type: ExceptionType;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export class AddAvailabilityExceptionCommand {
  constructor(public readonly payload: AddAvailabilityExceptionPayload) {}
}
