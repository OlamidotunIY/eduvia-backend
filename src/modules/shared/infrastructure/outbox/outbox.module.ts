import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OutboxPublisherService } from './outbox-publisher.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'auth-events' }, { name: 'user-events' }),
  ],
  providers: [PrismaService, OutboxPublisherService],
})
class OutboxModule {}

export { OutboxModule };
