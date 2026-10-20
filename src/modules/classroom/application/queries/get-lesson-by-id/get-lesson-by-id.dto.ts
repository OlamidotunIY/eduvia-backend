import { LessonStatus, NoShowType, VideoProvider } from '../../../domain';

export interface LessonDto {
  id: string;
  orgId: string;
  classroomId: string;
  teacherId: string;
  coverTeacherId: string | null;
  scheduledAt: Date;
  durationMins: number;
  status: LessonStatus;
  meetingId: string | null;
  videoProvider: VideoProvider | null;
  meetLink: string | null;
  cancelledReason: string | null;
  cancelledBy: string | null;
  noShowAt: Date | null;
  noShowType: NoShowType | null;
  startedAt: Date | null;
  completedAt: Date | null;
  markedAt: Date | null;
  reportedAt: Date | null;
  archivedAt: Date | null;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}
