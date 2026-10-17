import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { INotificationRepository } from '../../../domain';

@Injectable()
export class NotificationCleanupScheduler {
  private readonly logger = new Logger(NotificationCleanupScheduler.name);

  constructor(private readonly notificationRepository: INotificationRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyNotificationCleanup(): Promise<void> {
    this.logger.log('Starting daily 90-day notification retention cleanup...');

    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deletedCount = await this.notificationRepository.deleteOlderThan(ninetyDaysAgo);
      this.logger.log(
        `Daily notification cleanup completed: purged ${deletedCount} notifications older than 90 days.`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to execute daily notification cleanup: ${err.message}`,
        err.stack,
      );
    }
  }
}
