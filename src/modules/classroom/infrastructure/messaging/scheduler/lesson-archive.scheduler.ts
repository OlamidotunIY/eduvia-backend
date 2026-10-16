import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ILessonRepository } from '../../domain';

@Injectable()
export class LessonArchiveScheduler {
  private readonly logger = new Logger(LessonArchiveScheduler.name);

  constructor(private readonly lessonRepository: ILessonRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveReportedLessons(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const eligibleLessons = await this.lessonRepository.findReportedOlderThan(sevenDaysAgo);
    for (const lesson of eligibleLessons) {
      try {
        lesson.archive();
        await this.lessonRepository.save(lesson);
        this.logger.log(`Archived lesson ${lesson.id.value}`);
      } catch (err) {
        this.logger.error(`Failed to auto-archive lesson ${lesson.id.value}`, err);
      }
    }
  }
}
