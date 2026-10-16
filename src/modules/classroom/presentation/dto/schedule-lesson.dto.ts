export class ScheduleLessonDto {
  scheduledAt: string;
  durationMins?: number;
  teacherId?: string;
  isRecurring?: boolean;
}
