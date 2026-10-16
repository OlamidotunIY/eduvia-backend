import { ExceptionType } from '../../../domain';

export class AddAvailabilityExceptionDto {
  date: string;
  type: ExceptionType;
  startTime?: string;
  endTime?: string;
  reason?: string;
}
