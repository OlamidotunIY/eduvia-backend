import { ClassroomStatus } from '../../../domain';

export interface ClassroomDto {
  id: string;
  orgId: string;
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  status: ClassroomStatus;
  lessonDurationMins: number;
  maxStudents: number;
  recurrence: {
    dayOfWeek: number;
    startTime: string;
    timezone: string;
    intervalWeeks: number;
    effectiveFrom: Date;
    effectiveUntil: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}
