export interface AvailabilitySlotItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface SetTeacherAvailabilityPayload {
  orgId: string;
  teacherId: string;
  slots: AvailabilitySlotItem[];
}

export class SetTeacherAvailabilityCommand {
  constructor(public readonly payload: SetTeacherAvailabilityPayload) {}
}
