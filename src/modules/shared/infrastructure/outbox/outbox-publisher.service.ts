import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OutboxStatus } from '@generated/prisma/enums';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { OUTBOX_EVENT_ROUTES } from './outbox-event-routes';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private readonly batchSize = Number(process.env.OUTBOX_PUBLISH_BATCH_SIZE ?? 50);
  private isPublishing = false;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('auth-events') private readonly authEventsQueue: Queue,
    @InjectQueue('user-events') private readonly userEventsQueue: Queue,
    @InjectQueue('org-events') private readonly orgEventQueue: Queue,
    @InjectQueue('classroom-events') private readonly classroomEventQueue: Queue,
    @InjectQueue('board-events') private readonly boardEventsQueue: Queue,
    @InjectQueue('assessment-events') private readonly assessmentEventsQueue: Queue,
    @InjectQueue('search-events') private readonly searchEventsQueue: Queue,
    @InjectQueue('progress-events') private readonly progressEventsQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async publishOutboxMessages(): Promise<void> {
    await this.publishPending();
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

      if (messages.length === 0) {
        return;
      }

      for (const message of messages) {
        const queue = this.resolveQueue(message.type);

        if (!queue) {
          const structuredError = JSON.stringify({
            code: 'UNROUTABLE_EVENT',
            message: `No BullMQ route configured for ${message.type}`,
            occurredAt: new Date().toISOString(),
          });
          this.logger.error(
            `Dead-lettering unroutable outbox message ${message.id} (${message.type}): No BullMQ route configured`,
          );
          await this.prisma.outboxMessage.update({
            where: { id: message.id },
            data: {
              status: OutboxStatus.FAILED,
              lastError: structuredError,
            },
          });
          continue;
        }

        try {
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
        } catch (queueError) {
          const nextAttempts = message.attempts + 1;
          const maxAttempts = 5;
          const isExhausted = nextAttempts >= maxAttempts;

          const errorPayload = JSON.stringify({
            code: 'QUEUE_PUBLISH_ERROR',
            message: (queueError as Error)?.message ?? 'Unknown queue publish error',
            attempt: nextAttempts,
            occurredAt: new Date().toISOString(),
          });

          await this.prisma.outboxMessage.update({
            where: { id: message.id },
            data: {
              attempts: nextAttempts,
              status: isExhausted ? OutboxStatus.FAILED : OutboxStatus.PENDING,
              lastError: errorPayload,
            },
          });

          if (isExhausted) {
            this.logger.error(
              `Outbox message ${message.id} (${message.type}) failed permanently after ${nextAttempts} attempts`,
              queueError,
            );
          } else {
            this.logger.warn(
              `Outbox message ${message.id} (${message.type}) transient error (attempt ${nextAttempts}/${maxAttempts}): ${(queueError as Error)?.message}`,
            );
          }
        }
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

    if (queueName === 'org-events') {
      return this.orgEventQueue;
    }

    if (queueName === 'classroom-events') {
      return this.classroomEventQueue;
    }

    if (queueName === 'board-events') {
      return this.boardEventsQueue;
    }

    if (queueName === 'assessment-events') {
      return this.assessmentEventsQueue;
    }

    if (queueName === 'search-events') {
      return this.searchEventsQueue;
    }

    if (queueName === 'progress-events') {
      return this.progressEventsQueue;
    }

    return null;
  }
}

export { OutboxPublisherService };
