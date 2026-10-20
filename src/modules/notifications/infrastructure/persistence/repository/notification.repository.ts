import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Notification,
  NotificationId,
  INotificationRepository,
  NotificationFilter,
  NotificationStatus,
} from '../../../domain';
import { Notification as PrismaNotification } from '@generated/prisma/client';
import { NotificationMapper } from '../mappers/notification.mapper';

@Injectable()
export class PrismaNotificationRepository
  extends PrismaBaseRepository<NotificationId, Notification, PrismaNotification>
  implements INotificationRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly notificationMapper: NotificationMapper,
  ) {
    super(prisma, notificationMapper);
  }

  protected get delegate() {
    return this.prisma.notification;
  }

  public override async findById(id: NotificationId | string): Promise<Notification | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.notification.findUnique({
      where: { id: rawId },
    });
    return record ? this.notificationMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.notificationMapper.toDomain(record));
  }

  public override async save(entity: Notification): Promise<void> {
    const data = this.notificationMapper.toPersistence(entity);
    const notificationId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.upsert({
        where: { id: notificationId },
        create: {
          id: notificationId,
          ...data,
        },
        update: data,
      });

      for (const event of events) {
        await tx.outboxMessage.create({
          data: {
            id: typeof event.eventId === 'string' ? event.eventId : String(event.eventId),
            eventId: event.eventId,
            type: event.eventName,
            aggregateType: entity.constructor.name,
            aggregateId: entity.getId(),
            payload: event.payload as object,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
            status: 'PENDING' as any,
          },
        });
      }
    });
  }

  public async findByRecipientId(
    recipientId: string,
    filter?: NotificationFilter,
  ): Promise<Notification[]> {
    const where: any = { recipientId };
    if (filter?.status) {
      where.status = filter.status;
    }

    const records = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: filter?.offset ?? 0,
      take: filter?.limit ?? 50,
    });

    return records.map((r) => this.notificationMapper.toDomain(r));
  }

  public async countUnreadByRecipientId(recipientId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        recipientId,
        status: NotificationStatus.unread,
      },
    });
  }

  public async markAllReadByRecipientId(recipientId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        recipientId,
        status: NotificationStatus.unread,
      },
      data: {
        status: NotificationStatus.read,
        readAt: new Date(),
      },
    });
  }

  public async deleteOlderThan(cutoffDate: Date): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    return result.count;
  }
}
