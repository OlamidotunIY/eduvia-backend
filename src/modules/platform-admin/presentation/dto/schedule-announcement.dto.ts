import { IsDateString, IsNotEmpty } from 'class-validator';

export class ScheduleAnnouncementDto {
  @IsNotEmpty()
  @IsDateString()
  scheduledAt!: string;
}
