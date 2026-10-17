import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Notification,
  NotificationId,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '../../../domain';
import { Notification as PrismaNotification } from '@generated/prisma/client';

@Injectable()
export class NotificationMapper implements IMapper<Notification, PrismaNotification> {
  toDomain(record: PrismaNotification): Notification {
    const data =
      record.data && typeof record.data === 'object'
        ? (record.data as Record<string, any>)
        : {};

    return Notification.reconstitute({
      id: NotificationId.from(record.id),
      recipientId: record.recipientId,
      type: record.type as NotificationType,
      title: record.title,
      body: record.body,
      data,
      channel: record.channel as NotificationChannel,
      status: record.status as NotificationStatus,
      deliveredAt: record.deliveredAt,
      readAt: record.readAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Notification): PrismaNotification {
    return {
      id: entity.id.toString(),
      recipientId: entity.recipientId,
      type: entity.type,
      title: entity.title,
      body: entity.body,
      data: entity.data,
      channel: entity.channel,
      status: entity.status,
      deliveredAt: entity.deliveredAt,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
