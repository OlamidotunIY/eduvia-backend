import { BaseRepository } from '@modules/shared/domain';
import { PlatformAnnouncementId, AnnouncementStatus } from '../value-objects';
import { PlatformAnnouncement } from '../model/PlatformAnnouncement';

export abstract class IPlatformAnnouncementRepository extends BaseRepository<
  PlatformAnnouncement,
  PlatformAnnouncementId
> {
  public abstract findByStatus(status: AnnouncementStatus): Promise<PlatformAnnouncement[]>;
  public abstract findDueScheduled(now: Date): Promise<PlatformAnnouncement[]>;
}
