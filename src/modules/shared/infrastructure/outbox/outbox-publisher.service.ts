import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OutboxStatus } from '@generated/prisma/enums';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { OUTBOX_EVENT_ROUTES } from './outbox-event-routes';

@Injectable()
class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private readonly intervalMs = Number(process.env.OUTBOX_PUBLISH_INTERVAL_MS ?? 5000);
  private readonly batchSize = Number(process.env.OUTBOX_PUBLISH_BATCH_SIZE ?? 50);
  private timer: NodeJS.Timeout | undefined;
  private isPublishing = false;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('auth-events') private readonly authEventsQueue: Queue,
    @InjectQueue('user-events') private readonly userEventsQueue: Queue,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.publishPending(), this.intervalMs);
    void this.publishPending();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async publishPending(): Promise<void> {
    if (this.isPublishing) {
      return;
    }

    this.isPublishing = true;

    try {
      const messages = await this.prisma.outboxMessage.findMany({
        where: { status: OutboxStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: this.batchSize,
      });

      for (const message of messages) {
        const queue = this.resolveQueue(message.type);

        if (!queue) {
          this.logger.warn(`No BullMQ route configured for ${message.type}`);
          continue;
        }

        await queue.add(
          message.type,
          {
            eventId: message.eventId,
            aggregateId: message.aggregateId,
            aggregateType: message.aggregateType,
            correlationId: message.correlationId,
            occurredAt: message.occurredAt,
            payload: message.payload,
          },
          { jobId: message.id },
        );

        await this.prisma.outboxMessage.update({
          where: { id: message.id },
          data: {
            status: OutboxStatus.PROCESSED,
            processedAt: new Date(),
            lastError: null,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to publish pending outbox messages', error);
    } finally {
      this.isPublishing = false;
    }
  }

  private resolveQueue(eventType: string): Queue | null {
    const queueName = OUTBOX_EVENT_ROUTES.get(eventType);

    if (queueName === 'auth-events') {
      return this.authEventsQueue;
    }

    if (queueName === 'user-events') {
      return this.userEventsQueue;
    }

    return null;
  }
}

export { OutboxPublisherService };
