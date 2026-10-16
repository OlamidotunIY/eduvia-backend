import { ExceptionType } from '../../../domain';

export interface AvailabilitySlotDto {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface AvailabilityExceptionDto {
  id: string;
  date: Date;
  type: ExceptionType;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

export interface TeacherAvailabilityDto {
  id: string;
  orgId: string;
  teacherId: string;
  slots: AvailabilitySlotDto[];
  exceptions: AvailabilityExceptionDto[];
  createdAt: Date;
  updatedAt: Date;
}
