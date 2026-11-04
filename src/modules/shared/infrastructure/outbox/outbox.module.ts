import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { OutboxPublisherService } from './outbox-publisher.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'auth-events' },
      { name: 'user-events' },
      { name: 'org-events' },
      { name: 'classroom-events' },
      { name: 'board-events' },
      { name: 'assessment-events' },
      { name: 'search-events' },
      { name: 'progress-events' },
    ),
  ],
  providers: [OutboxPublisherService],
})
class OutboxModule {}

export { OutboxModule };
