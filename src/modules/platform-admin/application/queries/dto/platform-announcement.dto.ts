import { AnnouncementStatus } from '../../../domain';

export interface PlatformAnnouncementDto {
  id: string;
  title: string;
  body: string;
  targetRoles: string[];
  status: AnnouncementStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
