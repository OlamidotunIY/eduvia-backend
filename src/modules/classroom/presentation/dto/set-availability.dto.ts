export class AvailabilitySlotInputDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export class SetTeacherAvailabilityDto {
  slots: AvailabilitySlotInputDto[];
}
