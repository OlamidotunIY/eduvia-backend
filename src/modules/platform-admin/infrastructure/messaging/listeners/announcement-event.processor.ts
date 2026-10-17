import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AnnouncementCreatedEvent } from '../../../domain';

@Processor('platform-admin-events')
export class AnnouncementEventProcessor extends WorkerHost {
  private readonly logger = new Logger(AnnouncementEventProcessor.name);

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === AnnouncementCreatedEvent.name) {
      const payload = job.data.payload as AnnouncementCreatedEvent.Payload;
      this.logger.log(
        `Processing AnnouncementCreatedEvent for announcement: ${payload.announcementId} (title: ${payload.title})`,
      );
      return;
    }
  }
}
