import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IPlatformAnnouncementRepository } from '../../../domain';

@Injectable()
export class AnnouncementPublisherScheduler {
  private readonly logger = new Logger(AnnouncementPublisherScheduler.name);

  constructor(
    private readonly announcementRepository: IPlatformAnnouncementRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledAnnouncements(): Promise<void> {
    try {
      const now = new Date();
      const due = await this.announcementRepository.findDueScheduled(now);

      if (due.length === 0) {
        return;
      }

      this.logger.log(`Found ${due.length} scheduled announcement(s) due for publishing.`);

      for (const announcement of due) {
        try {
          announcement.publish();
          await this.announcementRepository.save(announcement);
          this.logger.log(`Successfully auto-published announcement ${announcement.id.toString()}.`);
        } catch (itemErr: any) {
          this.logger.error(
            `Failed to auto-publish announcement ${announcement.id.toString()}: ${itemErr.message}`,
            itemErr.stack,
          );
        }
      }
    } catch (err: any) {
      this.logger.error(
        `Failed to run announcement publishing scheduler: ${err.message}`,
        err.stack,
      );
    }
  }
}
